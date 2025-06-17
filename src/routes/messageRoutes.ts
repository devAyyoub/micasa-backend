import { Router } from "express";
import { MessageController } from "../controllers/MessageController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", verifyToken, MessageController.getUserChatRooms)
router.post("/", verifyToken, MessageController.sendMessage);
router.get("/:chatRoomId", verifyToken, MessageController.getMessages);
router.patch("/:chatRoomId/read", verifyToken, MessageController.markAsRead);
router.post("/from-match/:matchId", verifyToken, MessageController.findOrCreateFromMatch)

export default router;