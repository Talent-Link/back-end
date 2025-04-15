import "express-session";

declare module "express-session" {
  interface Session {
    userType?: "RH" | "CANDIDATO";
  }
}