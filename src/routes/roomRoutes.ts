import express from "express";
import RoomController from "../controllers/roomController";
import { verifyToken } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import multer from "multer";

const router = express.Router();

router.post("/", verifyToken, RoomController.createRoom);
router.get("/", RoomController.getRooms);
router.get("/mine", verifyToken, RoomController.getMyRooms);
router.post(
  "/upload",
  verifyToken,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res
          .status(400)
          .json({ message: "Error de subida", error: err.message });
      } else if (err) {
        res
          .status(400)
          .json({ message: "Archivo no válido", error: err.message });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "No se subió ninguna imagen" });
      return;
    }

    res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
  }
);
router.post(
  "/upload-multiple",
  verifyToken,
  (req, res, next) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res
          .status(400)
          .json({ message: "Error de subida", error: err.message });
      } else if (err) {
        res
          .status(400)
          .json({ message: "Archivo no válido", error: err.message });
      } else {
        next();
      }
    });
  },
  (req, res) => {
    if (!req.files || !(req.files instanceof Array)) {
      res.status(400).json({ message: "No se subieron imágenes" });
      return;
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(200).json({ images: urls });
  }
);

router.put("/:id", verifyToken, RoomController.updateRoom);
router.delete("/:id", verifyToken, RoomController.deleteRoom);
router.get("/:id", RoomController.getRoomById);

export default router;
