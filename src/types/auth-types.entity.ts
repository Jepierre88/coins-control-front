import type { Session, User } from "better-auth";

export type AppUser = User & {
  identificationNumber: string;
  holdingId: number;
};

export type AppSession = Session & {
  externalToken: string; // el token del backend externo
};
