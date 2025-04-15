import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  sub: string;
  userType: "RH" | "CANDIDATO";
  iat: number;
  exp: number;
}

/**
 * Garante que o header Authorization: Bearer <token> exista e seja válido.
 * Em seguida anexa req.user = { id, userType }.
 */
export function ensureToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).send("Token não fornecido");
    return;
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // injeta no req.user
    req.user = { id: payload.sub, userType: payload.userType };
    next();
  } catch {
    res.status(401).send("Token inválido");
  }
}

/**
 * Middleware extra, se quiser restringir só ao RH
 */
export function onlyRH(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if ((req.user as any)?.userType !== "RH") {
    res.status(403).send("Somente RH pode acessar");
    return;
  }
  next();
}

/**
 * Middleware extra, se quiser restringir só ao CANDIDATO
 */
export function onlyCandidato(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if ((req.user as any)?.userType !== "CANDIDATO") {
    res.status(403).send("Somente Candidato pode acessar");
    return;
  }
  next();
}
