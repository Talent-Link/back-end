import { Router } from "express";
import { getForms, createForm, deleteForm, updateForm } from "../controllers/formController";
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

export default router;