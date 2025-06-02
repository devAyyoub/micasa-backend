import { Request, Response } from "express";
import User from "../models/User";
import mongoose from "mongoose";

export default class UserController {
  static getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener perfil", error: err });
    }
  };

  static updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const { name, email } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, email },
        { new: true, runValidators: true, select: "-password" }
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al actualizar perfil", error: err });
    }
  };

  static toggleFavorite = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const user = await User.findById(req.user.id);
      const roomId = req.params.roomId;

      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const index = user.favorites.findIndex(
        (fav) => fav.toString() === roomId
      );

      if (index !== -1) {
        user.favorites.splice(index, 1); // quitar
      } else {
        user.favorites.push(new mongoose.Types.ObjectId(roomId)); // añadir
      }

      await user.save();
      res.status(200).json({ favorites: user.favorites });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al gestionar favorito", error: err });
    }
  };

  static getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "No autorizado" });
        return;
      }

      const user = await User.findById(req.user.id).populate("favorites");
      if (!user) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      res.status(200).json(user.favorites);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error al obtener favoritos", error: err });
    }
  };
}
