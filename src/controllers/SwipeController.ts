import { Request, Response } from "express";
import Room from "../models/Room";
import { RoomLike } from "../models/RoomLike";
import { RoomMatch } from "../models/RoomMatch";
import { RoomView } from "../models/RoomView";
import { OwnerLike } from "../models/OwnerLike";

export class SwipeController {
  static async getNextRoom(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const likedRoomIds = await RoomLike.find({ userId }).distinct("roomId");
    const viewedRoomIds = await RoomView.find({ userId }).distinct("roomId");

    const room = await Room.findOne({
      _id: { $nin: [...likedRoomIds, ...viewedRoomIds] },
      user: { $ne: userId },
    }).sort({ createdAt: -1 });

    if (!room) {
      res.status(404).json({ message: "No hay más habitaciones disponibles." });
      return;
    }

    await RoomView.create({ userId, roomId: room._id });

    res.json(room);
  }

  static async likeRoom(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404).json({ message: "Habitación no encontrada." });
      return;
    }

    const existingLike = await RoomLike.findOne({ userId, roomId });
    if (existingLike) {
      res.status(400).json({ message: "Ya diste like a esta habitación." });
      return;
    }

    await RoomLike.create({ userId, roomId });

    const reciprocal = await OwnerLike.findOne({
      ownerId: room.user,
      userId,
      roomId,
    });

    if (reciprocal) {
      await RoomMatch.create({
        userId,
        ownerId: room.user,
        roomId,
      });
    }

    res.status(201).json({ message: "Like registrado." });
  }

  static async likeUserFromRoom(req: Request, res: Response): Promise<void> {
    const ownerId = req.user!.id;
    const { userId, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room || room.user.toString() !== ownerId) {
      res.status(403).json({ message: "No tienes permiso para esta acción." });
      return;
    }

    const existing = await OwnerLike.findOne({ ownerId, userId, roomId });
    if (existing) {
      res.status(400).json({ message: "Ya diste like a este usuario." });
      return;
    }

    await OwnerLike.create({ ownerId, userId, roomId });

    const reciprocal = await RoomLike.findOne({ userId, roomId });

    if (reciprocal) {
      await RoomMatch.create({ userId, ownerId, roomId });
    }

    res.status(201).json({ message: "Like al usuario registrado." });
  }

  static async getMatches(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const matches = await RoomMatch.find({
      $or: [{ userId }, { ownerId: userId }],
    })
      .populate("roomId", "title location description images")
      .populate("userId", "name email")
      .populate("ownerId", "name email");

    res.json(matches);
  }

  static async getLikesReceived(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.user!.id;

      const ownedRoomIds = await Room.find({ user: ownerId }).distinct("_id");

      const likes = await RoomLike.find({ roomId: { $in: ownedRoomIds } })
        .populate("userId", "name email")
        .populate("roomId", "title location images");

      res.json(likes);
    } catch (err) {
      console.error("Error en getLikesReceived:", err);
      res.status(500).json({ message: "Error al obtener likes recibidos." });
    }
  }
}
