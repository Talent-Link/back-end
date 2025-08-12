import { Router } from 'express';
import {
  getCandidateProfile,
  createOrUpdateCandidateProfile,
  uploadResume,
  deleteResume,
  getCandidateProfileById,
  getCandidateResume
} from '../controllers/candidateProfileController';
import { ensureToken, onlyCandidato, onlyRH } from '../../../shared/middlewares/jwtAuth';

const router = Router();

// Rotas para candidatos (próprio perfil)
router.get('/profile', ensureToken, onlyCandidato, getCandidateProfile);
router.put('/profile', ensureToken, onlyCandidato, createOrUpdateCandidateProfile);
router.post('/profile/resume', ensureToken, onlyCandidato, uploadResume);
router.delete('/profile/resume', ensureToken, onlyCandidato, deleteResume);

// Rotas para RH (visualizar perfil de candidatos)
router.get('/profile/:candidateId', ensureToken, onlyRH, getCandidateProfileById);
router.get('/profile/:candidateId/resume', ensureToken, onlyRH, getCandidateResume);

export default router;
