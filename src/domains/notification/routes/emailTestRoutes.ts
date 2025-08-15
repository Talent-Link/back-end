import { Router } from "express";
import { 
  testEmailConnection, 
  sendTestEmail, 
  testApplicationEmail 
} from "../controllers/emailTestController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Middleware para garantir autenticação
router.use(ensureToken);

// Testar conexão do serviço de email (público para RH)
router.get("/test-connection", testEmailConnection);

// Enviar email de teste (apenas RH)
router.post("/send-test", onlyRH, sendTestEmail);

// Testar template de email de candidatura (apenas RH)
router.post("/test-application", onlyRH, testApplicationEmail);

export default router;
