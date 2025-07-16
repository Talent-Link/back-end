import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getUserStats,
  searchUsers,
  getUserById
} from "../controllers/userController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

// GET /users/profile - Obter perfil do usuário autenticado
router.get("/profile", ensureToken, getProfile);

// PUT /users/profile - Atualizar perfil do usuário autenticado
router.put("/profile", ensureToken, updateProfile);

// GET /users/stats - Obter estatísticas do usuário
router.get("/stats", ensureToken, getUserStats);

// GET /users/search - Buscar usuários (apenas RH)
router.get("/search", ensureToken, onlyRH, searchUsers);

// GET /users/:id - Obter usuário específico por ID
router.get("/:id", ensureToken, getUserById);

export default router;
