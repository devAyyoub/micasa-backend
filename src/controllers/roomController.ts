import { Request, Response } from 'express';
import Room from '../models/Room';

export default class RoomController {
  static createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, price, location } = req.body;

      if (!req.user) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const room = await Room.create({
        title,
        description,
        price,
        location,
        user: req.user.id,
      });

      res.status(201).json(room);
    } catch (err) {
      res.status(500).json({ message: 'Error al crear habitación', error: err });
    }
  };

  static getRooms = async (_req: Request, res: Response): Promise<void> => {
    try {
      const rooms = await Room.find().populate('user', 'name email');
      res.status(200).json(rooms);
    } catch (err) {
      res.status(500).json({ message: 'Error al obtener habitaciones', error: err });
    }
  };

  static getMyRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const myRooms = await Room.find({ user: req.user.id }).populate('user', 'name email');
    res.status(200).json(myRooms);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tus habitaciones', error: err });
  }
};
}