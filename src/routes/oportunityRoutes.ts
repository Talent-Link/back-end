// src/routes/opportunityRoutes.ts
import { Router } from "express";
import {
  getAllOpportunities,
  getOpportunityById,
  getResponsesByOpportunity,
  createOpportunity,
  searchOpportunities,
  withdrawApplication,
  getUserOpportunities,
  deleteOpportunity,
  activateOpportunity,
  deactivateOpportunity,
} from "../controllers/opportunityController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

// GET   /opportunities              → qualquer usuário autenticado
router.get("/", ensureToken, getAllOpportunities);

// GET   /opportunities/my-applications → candidato vê suas candidaturas
router.get("/my-applications", ensureToken, getUserOpportunities);

// POST  /opportunities/search        → qualquer usuário autenticado
router.post("/search", ensureToken, searchOpportunities);

// POST  /opportunities               → só RH pode criar oportunidade
router.post("/", ensureToken, onlyRH, createOpportunity);

// GET   /opportunities/:id          → qualquer usuário autenticado
router.get("/:id", ensureToken, getOpportunityById);

// GET   /opportunities/:id/responses
//                                     → só RH pode ver respostas
router.get("/:id/responses", ensureToken, onlyRH, getResponsesByOpportunity);

// DELETE /opportunities/:responseId/withdraw → candidato retira candidatura
router.delete("/:responseId/withdraw", ensureToken, withdrawApplication);

// DELETE /opportunities/:id        → só RH pode deletar oportunidade
router.delete("/:id", ensureToken, onlyRH, deleteOpportunity);

// PATCH /opportunities/:id/activate → só RH pode ativar oportunidade
router.patch("/:id/activate", ensureToken, onlyRH, activateOpportunity);

// PATCH /opportunities/:id/deactivate → só RH pode desativar oportunidade
router.patch("/:id/deactivate", ensureToken, onlyRH, deactivateOpportunity);

export default router;
