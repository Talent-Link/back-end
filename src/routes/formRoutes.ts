import { Router } from "express";
import { getForms, createForm, deleteForm, updateForm, getFormById } from "../controllers/formController";
import { generateQuestionFromLocal } from "../controllers/formQuestionController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

// Todas as rotas de formulário exigem JWT válido e ser RH
router.use(ensureToken, onlyRH);

// Rota para criar um formulário
router.post("/", createForm);

// Rota para listar os formulários do RH autenticado
router.get("/", getForms);

// Rota para deletar um formulário
router.delete("/:id", deleteForm);

// Rota para editar um formulário
router.put("/:id", updateForm);

router.get("/:id", getFormById)


// Rota para gerar uma questão com base nas questões locais (sem salvar no banco)
router.post("/generate-local-question", generateQuestionFromLocal);

export default router;
