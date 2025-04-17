import { Router } from "express";
import { getAllCandidates, getCandidateById } from "../controllers/talentController";

const router = Router();

// Rota para obter todos os candidatos
router.get("/candidates", getAllCandidates);

// Rota para obter um candidato específico pelo ID
router.get("/candidates/:id", getCandidateById);

export default router;