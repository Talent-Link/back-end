import { Request, Response, NextFunction } from "express";


// Inicia o login com o Google e salva o tipo de usuário na sessão
export function loginWithGoogle(req: Request, res: Response, next: NextFunction): void {
  const userType = req.params.userType?.toUpperCase();

  if (userType !== "RH" && userType !== "CANDIDATO") {
    console.log("Tipo de usuário inválido recebido:", userType);
    res.status(400).send("Tipo de usuário inválido.");
    return; // Garante que a execução pare aqui
  }

  // Ignorando a tipagem para salvar o userType na sessão
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

// Callback do Google após login
export function handleGoogleCallback(req: Request, res: Response) {
  console.log("Sessão no callback do Google:", req.session);
  res.send("Login bem-sucedido!");
}

// Logout
export function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Erro ao fazer logout.");
    }
    res.send("Logout bem-sucedido!");
  });
}
// Retorna os dados do usuário autenticado  
export function getCurrentUser(req: Request, res: Response): void {  
    if (!req.user) {  
      res.status(401).send("Usuário não autenticado.");  
      return; // Garante que a execução pare aqui  
    }  
    
    res.json(req.user);  
  }