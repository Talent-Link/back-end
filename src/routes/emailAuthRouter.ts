import { Router } from "express";
import { registerUser, loginUser } from "../controllers/emailAuthController";

const router = Router();

// Rota para registro de usuário com email e senha
router.post("/register", registerUser);

// Rota para login com email e senha
router.post("/login", loginUser);

export default router;
