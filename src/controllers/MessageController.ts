import { Request, Response } from "express";
import { Message } from "../models/Message";
import { ChatRoom } from "../models/ChatRoom";
import { Types } from "mongoose";
import { RoomMatch } from "../models/RoomMatch";

export class MessageController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const senderId = new Types.ObjectId(req.user!.id);
      const { chatRoomId, content } = req.body;

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom || !chatRoom.participants.some((p) => p.equals(senderId))) {
        res.status(403).json({ message: "No tienes acceso a este chat." });
        return;
      }

      const message = await Message.create({
        chatRoomId,
        senderId,
        content,
      });

      res.status(201).json(message);
    } catch (err) {
      console.error("Error en sendMessage:", err);
      res.status(500).json({ message: "Error al enviar mensaje." });
    }
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const { chatRoomId } = req.params;

      const chatRoom = await ChatRoom.findById(chatRoomId).populate("roomId");
      if (!chatRoom || !chatRoom.participants.some((p) => p.equals(userId))) {
        res.status(403).json({ message: "No tienes acceso a este chat." });
        return;
      }

      const messages = await Message.find({ chatRoomId }).sort({ createdAt: 1 });
      res.json({ room: chatRoom.roomId || null, messages });
    } catch (err) {
      console.error("Error en getMessages:", err);
      res.status(500).json({ message: "Error al obtener mensajes." });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const { chatRoomId } = req.params;

      await Message.updateMany(
        {
          chatRoomId,
          senderId: { $ne: userId },
          readBy: { $ne: userId },
        },
        {
          $addToSet: { readBy: userId },
        }
      );

      res.status(200).json({ message: "Mensajes marcados como leídos." });
    } catch (err) {
      console.error("Error al marcar como leídos:", err);
      res.status(500).json({ message: "Error al marcar mensajes como leídos." });
    }
  }

  static async findOrCreateFromMatch(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { matchId } = req.params;

    const match = await RoomMatch.findById(matchId);
    if (!match || (match.userId.toString() !== userId && match.ownerId.toString() !== userId)) {
      res.status(403).json({ message: "No tienes acceso a este match." });
      return;
    }

    let chatRoom = await ChatRoom.findOne({ matchId });
    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        participants: [match.userId, match.ownerId],
        roomId: match.roomId,
        matchId,
      });
    }

    res.status(200).json(chatRoom);
  }

  static async getUserChatRooms(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);

      const chatRooms = await ChatRoom.find({
        participants: userId,
      })
        .populate("roomId")
        .lean();

      const roomIds = chatRooms.map((room) => room._id);

      const lastMessages = await Message.aggregate([
        { $match: { chatRoomId: { $in: roomIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$chatRoomId",
            content: { $first: "$content" },
            senderId: { $first: "$senderId" },
            createdAt: { $first: "$createdAt" },
          },
        },
      ]);

      const unreadCounts = await Message.aggregate([
        {
          $match: {
            chatRoomId: { $in: roomIds },
            senderId: { $ne: userId },
            readBy: { $ne: userId },
          },
        },
        {
          $group: {
            _id: "$chatRoomId",
            count: { $sum: 1 },
          },
        },
      ]);

      const chatRoomsWithData = chatRooms.map((room) => {
        const lastMessage = lastMessages.find((m) => m._id.equals(room._id));
        const unreadCount = unreadCounts.find((c) => c._id.equals(room._id))?.count || 0;

        return {
          _id: room._id,
          roomId: room.roomId || {
            title: "Habitación eliminada",
            location: "",
            images: [],
          },
          lastMessage,
          unreadCount,
        };
      });

      res.json(chatRoomsWithData);
    } catch (err) {
      console.error("Error al obtener chatRooms:", err);
      res.status(500).json({ message: "Error al obtener tus chats." });
    }
  }
}