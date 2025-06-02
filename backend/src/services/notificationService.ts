import Notification from "../models/Notification";
import { Server } from "socket.io";

export const createNotification = async (
  userId: string,
  message: string,
  io: Server
) => {
  const notification = await Notification.create({ user: userId, message });

  io.to(userId).emit("notification", notification);

  return notification;
};
