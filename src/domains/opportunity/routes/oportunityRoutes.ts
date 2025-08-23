// src/routes/opportunityRoutes.ts
import { Router } from "express";
import {
  getAllOpportunities,
  getRecentOpportunities,
  getOpportunityById,
  getResponsesByOpportunity,
  getCandidatesByOpportunity,
  createOpportunity,
  updateOpportunity,
  searchOpportunities,
  withdrawApplication,
  getUserOpportunities,
  deleteOpportunity,
  activateOpportunity,
  deactivateOpportunity,
  getOpportunitiesByRecruiter,
  numeroCandidatosPorOportunidade
} from "../controllers/opportunityController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// GET   /opportunities              → qualquer usuário autenticado
router.get("/", ensureToken, getAllOpportunities);

// GET   /opportunities/recent      → vagas mais recentes (padrão: 3, máximo configurável via query ?limit=5)
router.get("/recent", ensureToken, getRecentOpportunities);

// GET   /opportunities/my-applications → candidato vê suas candidaturas
router.get("/my-applications", ensureToken, getUserOpportunities);

// GET /opportunities/rh → só RH pode ver suas oportunidades
router.get("/rh", ensureToken, onlyRH, getOpportunitiesByRecruiter);

// POST  /opportunities/search        → qualquer usuário autenticado
router.post("/search", ensureToken, searchOpportunities);

// POST  /opportunities               → só RH pode criar oportunidade
router.post("/", ensureToken, onlyRH, createOpportunity);

// PUT   /opportunities/:id          → só RH pode editar oportunidade
router.put("/:id", ensureToken, onlyRH, updateOpportunity);

// GET   /opportunities/:id          → qualquer usuário autenticado
router.get("/:id", ensureToken, getOpportunityById);

// GET   /opportunities/:id/responses → só RH pode ver respostas
router.get("/:id/responses", ensureToken, onlyRH, getResponsesByOpportunity);

// GET   /opportunities/:id/candidates → só RH pode ver candidatos completos
router.get("/:id/candidates", ensureToken, onlyRH, getCandidatesByOpportunity);

// GET /opportunities/:id/candidates-count → só RH pode ver número de candidatos
router.get("/:id/candidates-count", ensureToken, onlyRH, numeroCandidatosPorOportunidade);

// DELETE /opportunities/:responseId/withdraw → candidato retira candidatura
router.delete("/:responseId/withdraw", ensureToken, withdrawApplication);

// DELETE /opportunities/:id        → só RH pode deletar oportunidade
router.delete("/:id", ensureToken, onlyRH, deleteOpportunity);

// PATCH /opportunities/:id/activate → só RH pode ativar oportunidade
router.patch("/:id/activate", ensureToken, onlyRH, activateOpportunity);

// PATCH /opportunities/:id/deactivate → só RH pode desativar oportunidade
router.patch("/:id/deactivate", ensureToken, onlyRH, deactivateOpportunity);

export default router;
