import express from 'express';
import RoomController from '../controllers/roomController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', verifyToken, RoomController.createRoom);
router.get('/', RoomController.getRooms);
router.get('/mine', verifyToken, RoomController.getMyRooms);

export default router;