import { Router } from "express";
import passport from "passport";
import {
  handleGoogleCallback,
  logout,
  getCurrentUser,
  isTokenBlacklisted,
} from "../controllers/authController";
import { isAuthenticated } from "../../../shared/middlewares/authMiddleware";
import { ensureToken } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Middleware híbrido que aceita tanto sessão quanto JWT
function authenticateUser(req: any, res: any, next: any): void {
  console.log('🔐 Verificando autenticação híbrida...');
  
  // Primeiro, tenta autenticação por JWT
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    
    // Verifica se o token está na blacklist
    if (isTokenBlacklisted(token)) {
      console.log('🚫 Token JWT está na blacklist (invalidado)');
      return res.status(401).send("Token invalidado. Faça login novamente.");
    }
    
    console.log('🎫 Token JWT detectado, usando ensureToken...');
    return ensureToken(req, res, next);
  }
  
  // Se não há JWT, tenta autenticação por sessão
  console.log('🍪 Tentando autenticação por sessão...');
  return isAuthenticated(req, res, next);
}

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

// Usuário atual autenticado (aceita tanto JWT quanto sessão)
router.get("/me", authenticateUser, getCurrentUser);

// Debug: verificar configuração OAuth
router.get("/debug/oauth", (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://talentlink-wd88.onrender.com'
    : process.env.BASE_URL || 'http://localhost:4000';
  
  res.json({
    environment: process.env.NODE_ENV,
    baseUrl,
    callbacks: {
      RH: `${baseUrl}/auth/google/RH/callback`,
      CANDIDATO: `${baseUrl}/auth/google/CANDIDATO/callback`
    }
  });
});

export default router;
