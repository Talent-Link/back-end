import { Router } from "express";
import { submitResponse, getResponses, hasCandidateResponded } from "../controllers/responseFormController";
import { ensureToken } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Todas as rotas exigem JWT válido
router.use(ensureToken);

// Rota para o candidato responder ao formulário
router.post("/responses", submitResponse);

// Rota para o RH visualizar respostas de um formulário
router.get("/responses/:formId", getResponses);

// Rota para verificar se o candidato já respondeu ao formulário
router.get("/:id/responded", hasCandidateResponded);

export default router;