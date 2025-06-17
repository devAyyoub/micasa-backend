import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes";
import roomRoutes from "./routes/roomRoutes";
import userRoutes from "./routes/userRoutes";
import swipeRoutes from "./routes/swipeRoutes";
import messageRoutes from "./routes/messageRoutes";

import { verifyTokenSocket } from "./middlewares/authSocketMiddleware";
import { Message } from "./models/Message";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware Express
app.use(cors());
app.use(express.json());

// Rutas REST
app.get("/", (_, res) => {
  res.send("MiCasaHoy API funcionando con TypeScript");
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));

// Socket.IO con autenticación
io.use(verifyTokenSocket); // JWT auth para sockets

io.on("connection", (socket) => {
  console.log(`📡 Usuario conectado: ${socket.user?.id}`);

  socket.on("joinRoom", (chatRoomId: string) => {
    socket.join(chatRoomId);
  });

  socket.on("sendMessage", async ({ chatRoomId, content }) => {
    if (!socket.user) {
      console.error("Usuario no autenticado en sendMessage");
      return;
    }

    const newMsg = await Message.create({
      chatRoomId,
      senderId: socket.user.id,
      content,
    });

    io.to(chatRoomId).emit("newMessage", {
      _id: newMsg._id,
      chatRoomId,
      senderId: socket.user.id,
      content: newMsg.content,
      createdAt: newMsg.createdAt,
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Usuario desconectado: ${socket.user?.id}`);
  });
});

// MongoDB + Listen
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB conectado");

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${port}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB", error);
    process.exit(1);
  }
};

export default start;