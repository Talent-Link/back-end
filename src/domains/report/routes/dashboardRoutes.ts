import { Router } from "express";
import { 
  getDashboardMetrics, 
  getCandidatosQualificados, 
  getDetalhesVaga 
} from "../controllers/dashboardController";
import { ensureToken } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// 📊 Métricas do dashboard RH
router.get("/metrics", ensureToken, getDashboardMetrics);

// 👥 Lista de candidatos qualificados
router.get("/candidatos", ensureToken, getCandidatosQualificados);

// 📋 Detalhes de uma vaga específica
router.get("/vaga/:vagaId", ensureToken, getDetalhesVaga);

export default router;
