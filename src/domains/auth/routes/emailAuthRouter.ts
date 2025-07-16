import { Router } from "express";
import { registerUser, loginUser, confirmEmail } from "../controllers/emailAuthController";

const router = Router();

// Rota para registro de usuário com email e senha
router.post("/register", registerUser);

// Rota para confirmação de email
router.get("/confirm", confirmEmail);

// Rota para login com email e senha
router.post("/login", loginUser);

export default router;
