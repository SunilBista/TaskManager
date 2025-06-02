import express from "express";
import {
  createTask,
  getUserTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import checkAuth from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", checkAuth, createTask);
router.get("/", checkAuth, getUserTasks);
router.put("/:id", checkAuth, updateTask);
router.delete("/:id", checkAuth, deleteTask);

export default router;
