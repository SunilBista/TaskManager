import { Request, Response } from "express";
import Task from "../models/Task";
import { createNotification } from "../services/notificationService";
import { Server } from "socket.io";

let io: Server;

export const setSocketInstance = (socketIo: Server) => {
  io = socketIo;
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, category, dueDate } = req.body;
    const userId = (req as any).user;

    const task = await Task.create({
      title,
      description,
      category,
      user: userId,
      dueDate,
    });

    await createNotification(userId, `New task "${title}" created`, io);
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const [tasks, totalTasks] = await Promise.all([
      Task.find({ user: userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Task.countDocuments({ user: userId }),
    ]);

    res.status(200).json({
      success: true,
      tasks,
      totalTasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user;
    const { title, description, status, category, completed } = req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status.toLowerCase();
    if (category !== undefined) updateData.category = category.toLowerCase();

    if (completed !== undefined) {
      updateData.completed = completed;
    } else if (status !== undefined) {
      updateData.completed = status.toLowerCase() === "completed";
    }

    if (
      status &&
      !["pending", "inprogress", "completed"].includes(status.toLowerCase())
    ) {
      res.status(400).json({
        error:
          "Invalid status. Must be 'pending', 'inprogress', or 'completed'",
      });
    }

    if (
      category &&
      !["high", "medium", "low"].includes(category.toLowerCase())
    ) {
      res.status(400).json({
        error: "Invalid category. Must be 'high', 'medium', or 'low'",
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({
      success: true,
      task,
      message: "Task updated successfully",
    });
  } catch (error: any) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    if (error.name === "CastError") {
      res.status(400).json({ error: "Invalid task ID format" });
    }

    res.status(500).json({
      error: "Failed to update task",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user;

    const task = await Task.findOneAndDelete({ _id: id, user: userId });

    if (!task) res.status(404).json({ error: "Task not found" });

    res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
};
