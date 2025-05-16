import { Router } from "express";
import {
  sendNotification,
  getNotifications,
  sendFeedback,
  getUserFeedbacks,
} from "../controllers/feedbackController";
import { ensureToken } from "../middlewares/jwtAuth";

const router = Router();

// Notificações
router.post("/send", ensureToken, sendNotification);
router.get("/", ensureToken, getNotifications);

// Feedbacks
router.post("/feedbacks/send", ensureToken, sendFeedback);
router.get("/feedbacks", ensureToken, getUserFeedbacks);

export default router;
