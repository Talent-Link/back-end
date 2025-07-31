import { Router } from "express";
import { 
  createOrUpdateCompany, 
  getCompany, 
  listCompaniesByRecruiter,
  uploadCompanyLogo,
  deleteCompanyLogo
} from "../controllers/companyController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// Rota para criar ou atualizar informações da empresa
router.post("/", ensureToken, onlyRH, createOrUpdateCompany);

// Rota para obter informações da empresa
router.get("/", ensureToken, onlyRH, getCompany);

// Rota para listar empresas do RH
router.get("/rh", ensureToken, onlyRH, listCompaniesByRecruiter);

// Rota para upload de logo da empresa
router.post("/logo", ensureToken, onlyRH, uploadCompanyLogo);

// Rota para excluir logo da empresa
router.delete("/logo", ensureToken, onlyRH, deleteCompanyLogo);

export default router;