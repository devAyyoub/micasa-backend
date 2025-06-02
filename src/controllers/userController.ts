import { Request, Response } from 'express';
import User from '../models/User';

export default class UserController {
  static getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener perfil', error: err });
    }
  };

  static updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const { name, email } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true, runValidators: true, select: '-password' }
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: 'Error al actualizar perfil', error: err });
    }
  };
}