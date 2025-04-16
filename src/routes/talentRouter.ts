import { Router } from "express";
import { getAllCandidates, getCandidateById } from "../controllers/talentController";
import { ensureToken } from "../middlewares/jwtAuth";

const router = Router();

// Todas as rotas exigem JWT válido
router.use(ensureToken);

// Retorna todos os candidatos
router.get("/", getAllCandidates);

// Retorna os detalhes de um candidato específico
router.get("/:id", getCandidateById);

export default router;