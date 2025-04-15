import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error("Erro capturado:", err.stack || err.message);
  res.status(500).send("Ocorreu um erro no servidor.");
}