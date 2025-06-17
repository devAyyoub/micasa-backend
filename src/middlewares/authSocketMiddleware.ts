import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

export const verifyTokenSocket = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.auth.token;
  console.log("🔐 Socket intentando conectar con token:", token);

  if (!token) {
    console.warn("⛔ Token no proporcionado.");
    return next(new Error("Token no proporcionado."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    console.log("✅ Token válido, user:", decoded);

    socket.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    };
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err);
    next(new Error("Token inválido."));
  }
};