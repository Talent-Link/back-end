import { Router } from "express";
import passport from "passport";
import {
  handleGoogleCallback,
  logout,
  getCurrentUser,
} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

// Início do login com Google
router.get(
  "/google/RH",
  passport.authenticate("google-RH", { scope: ["profile", "email"] })
);

router.get(
  "/google/CANDIDATO",
  passport.authenticate("google-CANDIDATO", { scope: ["profile", "email"] })
);

// Callback do Google
router.get(
  "/google/RH/callback",
  passport.authenticate("google-RH", { failureRedirect: "/" }),
  handleGoogleCallback
);

router.get(
  "/google/CANDIDATO/callback",
  passport.authenticate("google-CANDIDATO", { failureRedirect: "/" }),
  handleGoogleCallback
);

// Logout
router.get("/logout", logout);

// Usuário atual autenticado
router.get("/me", isAuthenticated, getCurrentUser);

export default router;
