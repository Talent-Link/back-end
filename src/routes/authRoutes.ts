import { Router } from "express";
import passport from "passport";
import { Session } from "express-session";

// Estendendo a interface da sessão para incluir userType
declare module "express-session" {
  interface Session {
    userType?: string;
  }
}

const router = Router();

//Rota de callback do Google (precisa vir antes da :userType)
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Sessão no callback do Google:", req.session);
    res.send("Login bem-sucedido!");
  }
);

//Rota para iniciar o login com Google, com o tipo de usuário
router.get(
  "/google/:userType",
  (req, res, next) => {
    // Converte o tipo para maiúsculo, para aceitar 'rh' e 'candidato' também
    const userType = req.params.userType?.toUpperCase();

    // Verifica se é um tipo válido
    if (userType !== "RH" && userType !== "CANDIDATO") {
      console.log("Tipo de usuário inválido recebido:", userType);
      res.status(400).send("Tipo de usuário inválido.");
      return;
    }

    // Armazena o tipo de usuário na sessão
    req.session.userType = userType;
    console.log("Sessão após definir userType:", req.session);

    // Salva a sessão e continua para o login do Google
    req.session.save((err) => {
      if (err) {
        console.error("Erro ao salvar a sessão:", err);
        res.status(500).send("Erro ao salvar a sessão.");
        return;
      }
      next();
    });
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Rota para logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Erro ao fazer logout");
    }
    res.send("Logout bem-sucedido!");
  });
});

export default router;
