// src/domains/auth/controllers/authController.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!; // defina JWT_SECRET no seu .env

/**
 * Inicia o login com o Google e salva o tipo de usuário na sessão
 */
export function loginWithGoogle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userType = req.params.userType?.toUpperCase();

  if (userType !== "RH" && userType !== "CANDIDATO") {
    console.log("Tipo de usuário inválido recebido:", userType);
    res.status(400).send("Tipo de usuário inválido.");
    return;
  }

  // Salva o tipo de usuário na sessão
  req.session.userType = userType;
  console.log("Sessão após definir userType:", req.session);

  req.session.save((err) => {
    if (err) {
      console.error("Erro ao salvar a sessão:", err);
      res.status(500).send("Erro ao salvar a sessão.");
      return;
    }
    next(); // Continua para o passport.authenticate
  });
}

/**
 * Callback do Google após login
 * Gera um JWT e retorna para o cliente
 */
export function handleGoogleCallback(req: Request, res: Response): void {
  const user = req.user as any;
  if (!user) {
    res.status(401).send("Usuário não autenticado.");
    return;
  }

  const payload = {
    sub: user.id,
    userType: user.userType,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  const html = `
    <html>
      <body>
        <script>
          window.opener.postMessage(
            ${JSON.stringify({
              token,
              user: {
                id: user.id,
                email: user.email,
                userType: user.userType,
                name: user.name,
                photoUrl: user.photoUrl,
              }
            })},
            "http://localhost:3000"
          );
          window.close();
        </script>
      </body>
    </html>
  `;

  res.send(html);
}


/**
 * Logout do usuário
 */
export function logout(req: Request, res: Response): void {
  req.logout((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      res.status(500).send("Erro ao fazer logout.");
      return;
    }
    res.send("Logout bem‑sucedido!");
  });
}

/**
 * Retorna os dados do usuário autenticado
 */
export function getCurrentUser(req: Request, res: Response): void {
  const user = req.user as any;
  if (!user) {
    res.status(401).send("Usuário não autenticado.");
    return;
  }
  res.json(user);
}
