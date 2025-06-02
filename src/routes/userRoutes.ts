import express from 'express';
import UserController from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/me', verifyToken, UserController.getProfile);
router.put('/me', verifyToken, UserController.updateProfile);
router.post('/favorites/:roomId', verifyToken, UserController.toggleFavorite);
router.get('/favorites', verifyToken, UserController.getFavorites);

export default router;