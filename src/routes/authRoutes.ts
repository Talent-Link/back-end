import { Router } from "express";
import passport from "passport";
import {
  handleGoogleCallback,
  logout,
  getCurrentUser,
} from "../controllers/authController";
import { validateUserType } from "../middlewares/validationMiddleware";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

// Rota de callback do Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  handleGoogleCallback
);

// Rota para iniciar login com Google e armazenar o tipo de usuário na sessão
router.get(
  "/google/:userType",
  validateUserType,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Rota para logout
router.get("/logout", logout);

// Rota para obter os dados do usuário autenticado
router.get("/me", isAuthenticated, getCurrentUser);

export default router;