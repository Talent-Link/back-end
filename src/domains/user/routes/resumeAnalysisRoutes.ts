import { Router } from "express";
import {
  analyzeCandidateResume,
  testAnalysisService,
  getResumeImprovementTips
} from "../controllers/resumeAnalysisController";
import { ensureToken, onlyCandidato } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Middleware para garantir que apenas candidatos autenticados acessem
router.use(ensureToken);

// Analisar currículo do candidato logado (apenas candidatos)
router.post("/analyze", onlyCandidato, analyzeCandidateResume);

// Testar disponibilidade do serviço de análise
router.get("/test", testAnalysisService);

// Obter dicas gerais de melhoria de currículo
router.get("/tips", getResumeImprovementTips);

export default router;
