import { Router } from 'express';
import {
  getCandidateProfile,
  createOrUpdateCandidateProfile,
  uploadResume,
  getCandidateProfileById
} from '../controllers/candidateProfileController';
import { ensureToken, onlyCandidato, onlyRH } from '../../../shared/middlewares/jwtAuth';

const router = Router();

// Rotas para candidatos (próprio perfil)
router.get('/profile', ensureToken, onlyCandidato, getCandidateProfile);
router.put('/profile', ensureToken, onlyCandidato, createOrUpdateCandidateProfile);
router.post('/profile/resume', ensureToken, onlyCandidato, uploadResume);

// Rotas para RH (visualizar perfil de candidatos)
router.get('/profile/:candidateId', ensureToken, onlyRH, getCandidateProfileById);

export default router;
