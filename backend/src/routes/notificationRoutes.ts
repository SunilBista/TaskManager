import express from "express";
import {
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController";
import checkAuth from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", checkAuth, getUserNotifications);
router.patch("/:id/read", checkAuth, markAsRead);
router.delete("/:id", checkAuth, deleteNotification);

export default router;
