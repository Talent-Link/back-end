import { Router } from "express";
import {
  createForm,
  getForms

} from "../controllers/formController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

// Todas as rotas de formulário exigem JWT válido e ser RH
router.use(ensureToken, onlyRH);

router.post("/", createForm);
router.get("/", getForms);

export default router;
