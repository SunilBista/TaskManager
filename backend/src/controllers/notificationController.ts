import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user;
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const createNotification = async (
  userId: string,
  message: string,
  io?: any
) => {
  const notification = await Notification.create({ message, user: userId });
  if (io) io.to(userId).emit("notification", notification);
};
