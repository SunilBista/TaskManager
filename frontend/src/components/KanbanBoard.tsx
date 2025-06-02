import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { formatDate } from "./utils/formatDate";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  user: string;
  createdAt: string;
  dueDate?: string;
  completed: boolean;
}

interface KanbanBoardProps {
  tasks: Task[];
  users: Map<string, string>;
  onUpdateTask: (taskId: string, updates: { status: string }) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusColumns = [
  {
    id: "pending",
    title: "Pending",
    color: "bg-red-50 border-red-200",
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-green-50 border-green-200",
  },
];

const getDisplayStatus = (apiStatus: string): string => {
  switch (apiStatus) {
    case "inprogress":
      return "In Progress";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    default:
      return apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1);
  }
};

const getStatusBadgeStyle = (status: string): string => {
  const displayStatus = getDisplayStatus(status);
  switch (displayStatus) {
    case "Pending":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getCategoryBadgeStyle = (category: string): string => {
  switch (category) {
    case "high":
      return "bg-red-50 text-red-800 hover:bg-red-200";
    case "medium":
      return "bg-blue-50 text-blue-800 hover:bg-yellow-200";
    case "low":
      return "bg-yellow-50 text-yellow-800 hover:bg-green-200";
    default:
      return "bg-gray-50 text-gray-800 hover:bg-gray-200";
  }
};

export function KanbanBoard({
  tasks,
  users,
  onUpdateTask,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    console.log("dragOver", columnId);
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    console.log("Leave");
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    console.log("drop", columnId);

    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== columnId) {
      await onUpdateTask(draggedTask._id, { status: columnId });
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(
      (task) =>
        task.status === status || (task.completed && status === "completed")
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusColumns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`flex flex-col ${
              column.color
            } border-2 rounded-lg p-4 min-h-[600px] transition-all duration-200 ${
              isDragOver ? "border-blue-400 bg-blue-50" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.map((task) => (
                <Card
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={`cursor-move transition-all duration-200 hover:shadow-md ${
                    draggedTask?._id === task._id ? "opacity-50 rotate-2" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description || "No description"}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getCategoryBadgeStyle(
                            task.category || "medium"
                          )}`}
                        >
                          {task.category?.charAt(0).toUpperCase() +
                            task.category?.slice(1) || "Medium"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getStatusBadgeStyle(
                            task.status || "pending"
                          )}`}
                        >
                          {getDisplayStatus(task.status || "pending")}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>By: {users.get(task.user) || "Loading..."}</p>
                        <p>{formatDate(task.createdAt)}</p>
                      </div>

                      <div className="flex gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditTask(task)}
                          className="text-xs h-7 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteTask(task._id)}
                          className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
