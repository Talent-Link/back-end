import { Router } from "express";
import {
    getTalentBank,
    favoriteCandidate,
    unfavoriteCandidate
} from "../controllers/bankTalentController";
import { ensureToken, onlyRH } from "../middlewares/jwtAuth";

const router = Router();

router.use(ensureToken, onlyRH);
router.get("/", getTalentBank);
router.post("/favorite/:candidateId", favoriteCandidate);
router.delete("/unfavorite/:candidateId", unfavoriteCandidate);


export default router;
