import { Request, Response } from "express";
import Room from "../models/Room";
import { RoomLike } from "../models/RoomLike";
import { RoomMatch } from "../models/RoomMatch";
import { RoomView } from "../models/RoomView";

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

    // Registrar que el usuario ha visto esta habitación
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

    const reciprocalLike = await RoomLike.findOne({
      userId: room.user,
      roomId: { $in: await Room.find({ user: userId }).distinct("_id") },
    });

    if (reciprocalLike) {
      await RoomMatch.create({
        userId,
        ownerId: room.user,
        roomId,
      });
    }

    res.status(201).json({ message: "Like registrado." });
  }

  static async getMatches(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const matches = await RoomMatch.find({
      $or: [{ userId }, { ownerId: userId }],
    })
      .populate("roomId")
      .populate("userId", "name email")
      .populate("ownerId", "name email");

    res.json(matches);
  }
}
