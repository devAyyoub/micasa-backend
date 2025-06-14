import { Router } from "express";
import { SwipeController } from "../controllers/SwipeController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/next", verifyToken, SwipeController.getNextRoom);
router.post("/like", verifyToken, SwipeController.likeRoom);
router.get("/matches", verifyToken, SwipeController.getMatches);
router.post("/like-user", verifyToken, SwipeController.likeUserFromRoom);
router.get("/received-likes", verifyToken, SwipeController.getLikesReceived);

export default router;