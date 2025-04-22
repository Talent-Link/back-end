import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function ensureAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Anexa o usuário decodificado ao objeto req
    next();
  } catch (error) {
    console.error("Erro ao verificar o token JWT:", error);
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}