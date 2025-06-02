import express from 'express';
import RoomController from '../controllers/roomController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', verifyToken, RoomController.createRoom);
router.get('/', RoomController.getRooms);

export default router;