import { Router } from "express";
import { createOrUpdateCompany, getCompany, listCompaniesByRecruiter } from "../controllers/companyController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

// Rota para criar ou atualizar informações da empresa
router.post("/", ensureToken, onlyRH, createOrUpdateCompany);

// Rota para obter informações da empresa
router.get("/", ensureToken, onlyRH, getCompany);

router.get("/rh", ensureToken, onlyRH, listCompaniesByRecruiter);

export default router;