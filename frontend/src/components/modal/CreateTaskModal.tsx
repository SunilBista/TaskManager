import { useState } from "react";
import { Button } from "../../components/ui/button";
import { checkMode } from "../utils/checkMode";

const BACKEND_URL = checkMode();
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    category: "low",
    dueDate: "",
  });

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(task),
      });

      if (!res.ok) throw new Error("Failed to create task");

      onSuccess?.();
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // format: yyyy-mm-dd
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Task</h2>

        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={task.title}
          onChange={handleChange}
          className="mb-3 p-2 w-full border rounded"
        />

        <textarea
          name="description"
          placeholder="Task description"
          value={task.description}
          onChange={handleChange}
          className="mb-3 p-2 w-full border rounded"
        />

        <select
          name="category"
          value={task.category}
          onChange={handleChange}
          className="mb-3 p-2 w-full border rounded"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Due Date Picker */}
        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={handleChange}
          min={getTodayDate()} // restrict to today or future
          className="mb-4 p-2 w-full border rounded"
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Save Task</Button>
        </div>
      </div>
    </div>
  );
};
