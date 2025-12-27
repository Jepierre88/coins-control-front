import type { Session, User } from "better-auth";

export type AppUser = User & {
  identificationNumber: string;
  holdingId: number;
};

export type AppSession = Session & {
  externalToken: string; // el token del backend externo
  buildings: Building[]; // Puedes reemplazar 'unknown' con el tipo adecuado si lo conoces
  selectedBuilding?: Building; // Puedes reemplazar 'unknown' con el tipo adecuado si lo conoces
};


export type Building = {
  id: number;
  name: string;
  address: string;
  description: string;
  state: boolean;
  clientId: string;
  username: string; 
  password: string;
  clientSecret: string;
  holdingId: number;
  staysId: string;
  urlImage: string;
};