// src/routes/opportunityRoutes.ts
import { Router } from "express";
import {
  getAllOpportunities,
  getOpportunityById,
  associateFormToOpportunity,
  getResponsesByOpportunity,
  createOpportunity
} from "../controllers/opportunityController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

// GET   /opportunities              → qualquer usuário autenticado
router.get("/", ensureToken, getAllOpportunities);

// GET   /opportunities/:id          → qualquer usuário autenticado
router.get("/:id", ensureToken, getOpportunityById);

// POST  /opportunities/associate-form
//                                     → só RH pode associar formulário
router.post("/associate-form", ensureToken, onlyRH, associateFormToOpportunity);

// GET   /opportunities/:id/responses
//                                     → só RH pode ver respostas
router.get("/:id/responses", ensureToken, onlyRH, getResponsesByOpportunity);

// POST  /opportunities               → só RH pode criar oportunidade
router.post("/", ensureToken, onlyRH, createOpportunity);

export default router;
