import { Router } from "express";
import {
    getTalentBank,
    favoriteCandidate,
    unfavoriteCandidate,
    isCandidateFavorited
} from "../controllers/bankTalentController";
import { ensureToken, onlyRH } from "../../../shared/middlewares/jwtAuth";

const router = Router();

router.use(ensureToken, onlyRH);
router.get("/", getTalentBank);
router.get("/status/:candidateId", isCandidateFavorited);
router.post("/favorite/:candidateId", favoriteCandidate);
router.delete("/unfavorite/:candidateId", unfavoriteCandidate);


export default router;
