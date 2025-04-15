import { Router } from "express";
import passport from "passport";
import {
  loginWithGoogle,
  handleGoogleCallback,
  logout,
  getCurrentUser,
} from "../controllers/authController";

const router = Router();

// Rota de callback do Google — precisa vir antes da rota com parâmetro
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  handleGoogleCallback
);

// Rota para iniciar login com Google e armazenar o tipo de usuário na sessão
router.get(
  "/google/:userType",
  loginWithGoogle,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Rota para logout
router.get("/logout", logout);

// Rota para obter os dados do usuário autenticado
router.get("/me", getCurrentUser);

export default router;