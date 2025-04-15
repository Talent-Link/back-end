import { Request, Response, NextFunction } from "express";

export function validateUserType(req: Request, res: Response, next: NextFunction): void {
  const userType = req.params.userType?.toUpperCase();

  if (userType !== "RH" && userType !== "CANDIDATO") {
    console.log("Tipo de usuário inválido recebido:", userType);
    res.status(400).send("Tipo de usuário inválido.");
    return; // Garante que a execução pare aqui
  }

  // Salva o tipo de usuário na sessão
  (req.session as any).userType = userType;
  console.log("Sessão após definir userType:", req.session);

  req.session.save((err) => {
    if (err) {
      console.error("Erro ao salvar a sessão:", err);
      res.status(500).send("Erro ao salvar a sessão.");
      return; // Garante que a execução pare aqui
    }
    next(); // Continua para o próximo middleware
  });
}