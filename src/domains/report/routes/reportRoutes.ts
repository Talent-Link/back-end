import { Router } from "express";
import { generateCandidateReport } from "../controllers/reportController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Todas as rotas exigem JWT válido e ser RH
router.use(ensureToken, onlyRH);

// Gera um relatório para um candidato específico com base em um formulário
router.get("/:candidateId/:opportunityId", generateCandidateReport);

export default router;