import { Router } from "express";
import { 
  generateCandidateReport,
  getDashboardAnalytics,
  getCandidatesByMonth,
  getOpportunityPerformance,
  getCandidateStatusDistribution,
  getOpportunityDetails,
  exportReport
} from "../controllers/reportController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Todas as rotas exigem JWT válido e ser RH
router.use(ensureToken, onlyRH);

// Dashboard Analytics
router.get("/analytics", getDashboardAnalytics);

// Candidatos por Mês
router.get("/candidates-by-month", getCandidatesByMonth);

// Desempenho por Vaga
router.get("/opportunity-performance", getOpportunityPerformance);

// Status dos Candidatos
router.get("/candidate-status", getCandidateStatusDistribution);

// Detalhamento por Vaga
router.get("/opportunity-details", getOpportunityDetails);

// Exportar Relatório
router.get("/export", exportReport);

// Gera um relatório para um candidato específico com base em um formulário
router.get("/:candidateId/:opportunityId", generateCandidateReport);

export default router;