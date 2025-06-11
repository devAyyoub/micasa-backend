import { Router } from "express";
import { SwipeController } from "../controllers/SwipeController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/swipe/next", verifyToken, SwipeController.getNextRoom);
router.post("/swipe/like", verifyToken, SwipeController.likeRoom);
router.get("/swipe/matches", verifyToken, SwipeController.getMatches);

export default router;