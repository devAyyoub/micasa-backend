import { Request, Response } from "express";
import Room from "../models/Room";

export default class RoomController {
  static createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, price, location } = req.body;

      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
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
      res
        .status(500)
        .json({ message: "Error al crear habitación", error: err });
    }
  };

  static getRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const { location, maxPrice, minPrice, page = 1, limit = 10 } = req.query;

      const filter: any = {};

      if (location) {
        filter.location = { $regex: new RegExp(location as string, "i") };
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const total = await Room.countDocuments(filter);
      const rooms = await Room.find(filter)
        .populate("user", "name email")
        .skip(skip)
        .limit(limitNumber);

      res.status(200).json({
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        data: rooms,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al filtrar habitaciones", error: err });
    }
  };

  static getMyRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const myRooms = await Room.find({ user: req.user.id }).populate(
        "user",
        "name email"
      );
      res.status(200).json(myRooms);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener tus habitaciones", error: err });
    }
  };
  static updateRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const roomId = req.params.id;
      const updates = req.body;

      const room = await Room.findById(roomId);
      if (!room) {
        res.status(404).json({ message: "Habitación no encontrada" });
        return;
      }

      if (room.user.toString() !== req.user.id) {
        res
          .status(403)
          .json({ message: "No tienes permiso para editar esta habitación" });
        return;
      }

      Object.assign(room, updates);
      await room.save();

      res.status(200).json(room);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al editar la habitación", error: err });
    }
  };

  static deleteRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const roomId = req.params.id;
      const room = await Room.findById(roomId);

      if (!room) {
        res.status(404).json({ message: "Habitación no encontrada" });
        return;
      }

      if (room.user.toString() !== req.user.id) {
        res
          .status(403)
          .json({ message: "No tienes permiso para eliminar esta habitación" });
        return;
      }

      await room.deleteOne();
      res.status(200).json({ message: "Habitación eliminada correctamente" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al eliminar la habitación", error: err });
    }
  };

  static getRoomById = async (req: Request, res: Response): Promise<void> => {
    try {
      const roomId = req.params.id;

      const room = await Room.findById(roomId).populate("user", "name email");

      if (!room) {
        res.status(404).json({ message: "Habitación no encontrada" });
        return;
      }

      res.status(200).json(room);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener la habitación", error: err });
    }
  };
}
