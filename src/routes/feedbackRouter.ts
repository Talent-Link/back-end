import { Router } from "express";
import { sendNotification, getNotifications} from "../controllers/feedbackController";
import { ensureToken } from "../middlewares/jwtAuth";

const router = Router();

// POST /notifications/send → envia uma notificação para um usuário
router.post("/send", ensureToken, sendNotification);

// GET /notifications → retorna todas as notificações do usuário logado
router.get("/", ensureToken, getNotifications);


export default router;
