import { betterAuth, Session, User } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { bearer } from "better-auth/plugins";
import { setSessionCookie } from "better-auth/cookies";
import { ENVIRONTMENT } from "./environment";
import { AppSession, AppUser, type Building } from "@/types/auth-types.entity";
import { ActionResponseEntity } from "@/types/action-response.entity";
import { getBuildingsByHoldingId } from "@/datasource/coins-control.datasource";

type ExternalLoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    identificationNumber: string;
    holdingId: number;
  };
};

type ExternalLoginErrorResponse = {
  error: {
    statusCode: number,
    name: string,
    message: string
  }
};

type ExternalUser = {
  id: string;
  name: string;
  email: string;
  identificationNumber: string;
  holdingId: number;
};

export function expiresAtFromJwt(token: string, fallbackMs = 60 * 60 * 1000): Date {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    ) as { exp?: number };

    if (typeof payload.exp === "number") return new Date(payload.exp * 1000);
  } catch {}

  return new Date(Date.now() + fallbackMs);
}


export function buildAppUser(external: ExternalUser, now = new Date()): AppUser {
  return {
    id: external.id,
    createdAt: now,
    updatedAt: now,
    email: external.email,
    emailVerified: true,
    name: external.name,
    image: null,

    identificationNumber: external.identificationNumber,
    holdingId: external.holdingId,
  };
}

export function buildAppSession(args: {
  userId: string;
  expiresAt: Date;
  externalToken: string;
  buildings: Building[];
  selectedBuilding?: Building;
  headers?: Headers;
  now?: Date;
}): AppSession {
  const now = args.now ?? new Date();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    userId: args.userId,
    token: crypto.randomUUID(), // token Better Auth (tuyo)
    expiresAt: args.expiresAt,
    ipAddress: args.headers?.get("x-forwarded-for") ?? null,
    userAgent: args.headers?.get("user-agent") ?? null,

    externalToken: args.externalToken,
    buildings: args.buildings,
    selectedBuilding: args.selectedBuilding,
  };
}

export const credentialsSignIn = createAuthEndpoint(
  "/credentials/sign-in",
  { method: "POST" },
  async (ctx): Promise<ActionResponseEntity<AppUser>> => {
    const { identificationNumber, password } = (ctx.body ?? {}) as {
      identificationNumber?: string;
      password?: string;
    };

    if (!identificationNumber || !password) {
      return ctx.json({
        data: undefined,
        success: false,
        message: "Identificación y contraseña son requeridos",
        statusCode: 400,
      });
    }

    const response = await fetch(`${ENVIRONTMENT.BACKEND_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificationNumber, password }),
    });

    if (!response.ok) {
      const errorData = (await response.json() as ExternalLoginErrorResponse).error?.message;
      return ctx.json({
        data: undefined,
        success: false,
        message: response.status === 401 ? "Credenciales inválidas" : errorData || "Error al iniciar sesión",
        statusCode: response.status,
      });
    }

    const data = (await response.json()) as ExternalLoginResponse;

    const expiresAt = expiresAtFromJwt(data.token);
    const user: AppUser = buildAppUser(data.user);

    // Fetch buildings using the external token we just obtained.
    const buildingsRes = await getBuildingsByHoldingId(String(user.holdingId), data.token);
    const buildings = buildingsRes.success && buildingsRes.data ? buildingsRes.data : [];
    const selectedBuilding = buildings.length > 0 ? buildings[0] : undefined;

    const session: AppSession = buildAppSession({
      userId: user.id,
      expiresAt,
      externalToken: data.token,
      buildings,
      selectedBuilding,
      headers: ctx.headers,
    });

    await setSessionCookie(ctx, { session: session as AppSession, user: user as AppUser });

    return ctx.json(
      {
        data: user,
        success: true,
        message: "Inicio de sesión exitoso",
      },
      { status: 200 }
    );
  }
);

export const setSelectedBuilding = createAuthEndpoint(
  "/session/set-selected-building",
  { method: "POST" },
  async (ctx): Promise<ActionResponseEntity<null>> => {
    const session = await getSessionFromCtx(ctx);
    if (!session) {
      return ctx.json({
        data: null,
        success: false,
        message: "No autenticado",
        statusCode: 401,
      });
    }

    const { buildingId } = (ctx.body ?? {}) as { buildingId?: string | number };
    if (buildingId === undefined || buildingId === null || String(buildingId).trim() === "") {
      return ctx.json({
        data: null,
        success: false,
        message: "buildingId es requerido",
        statusCode: 400,
      });
    }

    const currentSession = session.session as unknown as AppSession;
    const buildings = currentSession.buildings ?? [];
    const next = buildings.find((b) => String(b.id) === String(buildingId));

    if (!next) {
      return ctx.json({
        data: null,
        success: false,
        message: "El edificio no pertenece a la sesión actual",
        statusCode: 400,
      });
    }

    const updatedSession: AppSession = {
      ...currentSession,
      updatedAt: new Date(),
      selectedBuilding: next,
    };

    await setSessionCookie(ctx, {
      session: updatedSession as AppSession,
      user: session.user as unknown as AppUser,
    });

    return ctx.json({
      data: null,
      success: true,
      message: "Edificio seleccionado actualizado",
      statusCode: 200,
    });
  },
);

export const auth = betterAuth({
  session: { cookieCache: { enabled: true, maxAge: 7*24*60*60, strategy: "jwe", refreshCache: true } },
  plugins: [
    bearer(),
    {
      id: "api",
      endpoints: {
        credentialsSignIn,
        setSelectedBuilding,
      },
    },
  ],
});
