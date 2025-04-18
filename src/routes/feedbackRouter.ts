// src/routes/feedbackRouter.ts
import { Router } from "express";
import { sendFeedback, getFeedbackHistory } from "../controllers/feedbackController";

const router = Router();

// Aqui o path é só "/:candidateId", porque já está montado em "/feedback"
router.post("/:candidateId", sendFeedback);
router.get("/:candidateId", getFeedbackHistory);

export default router;
