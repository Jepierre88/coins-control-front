import { betterAuth, Session, User } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { bearer } from "better-auth/plugins";
import { setSessionCookie } from "better-auth/cookies";
import { ENVIRONTMENT } from "./environment";
import { AppSession, AppUser } from "@/types/auth-types.entity";

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
  };
}

export const credentialsSignIn = createAuthEndpoint(
  "/credentials/sign-in",
  { method: "POST" },
  async (ctx) => {
    const { identificationNumber, password } = (ctx.body ?? {}) as {
      identificationNumber?: string;
      password?: string;
    };

    if (!identificationNumber || !password) {
      return ctx.json({ error: "Missing identificationNumber/password" }, { status: 400 });
    }

    const response = await fetch(`${ENVIRONTMENT.BACKEND_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificationNumber, password }),
    });

    if (!response.ok) {
      const errorData = (await response.json() as ExternalLoginErrorResponse).error?.message;
      return ctx.json({ error: errorData || 'Login failed' }, { status: response.status });
    }

    const data = (await response.json()) as ExternalLoginResponse;

    const expiresAt = expiresAtFromJwt(data.token);
    const user: AppUser = buildAppUser(data.user);
    const session: AppSession = buildAppSession({
      userId: user.id,
      expiresAt,
      externalToken: data.token,
      headers: ctx.headers,
    });

    await setSessionCookie(ctx, { session: session as AppSession, user: user as AppUser });

    return ctx.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          identificationNumber: user.identificationNumber,
          holdingId: user.holdingId,
        },
      },
      { status: 200 }
    );
  }
);

export const auth = betterAuth({
  session: { cookieCache: { enabled: true, maxAge: 7*24*60*60, strategy: "jwe", refreshCache: true } },
  plugins: [
    bearer(),
    {
      id: "api",
      endpoints: {
        credentialsSignIn
      },
    },
  ],
});
