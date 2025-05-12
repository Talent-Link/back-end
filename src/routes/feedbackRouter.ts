// src/routes/notificationRoutes.ts
import { Router } from "express";
import {
  sendNotification,
  getNotifications,
  sendFeedback,
  getUserFeedbacks,
} from "../controllers/feedbackController";
import { ensureToken } from "../middlewares/jwtAuth";

const router = Router();

// 🔔 Notificações Gerais
// Enviar notificação (geral)
router.post("/send", ensureToken, sendNotification);

// Listar todas as notificações do usuário logado
router.get("/", ensureToken, getNotifications);

// ✅ Feedbacks
// Enviar feedback para um usuário específico
router.post("/feedbacks/send", ensureToken, sendFeedback);

// Listar todos os feedbacks do usuário logado
router.get("/feedbacks", ensureToken, getUserFeedbacks);

export default router;
