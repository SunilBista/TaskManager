import { useState } from "react";
import { Button } from "../../components/ui/button";

interface EditTaskModalProps {
  task: {
    _id: string;
    title: string;
    description: string;
    status: string;
  };
  onClose: () => void;
  onUpdate: (
    taskId: string,
    updatedFields: { title: string; description: string; status: string }
  ) => void;
}

export const EditTaskModal = ({
  task,
  onClose,
  onUpdate,
}: EditTaskModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(task._id, { title, description, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-[#002f3c] text-[#2f4f4f] dark:text-[#e0f2f1] p-6 rounded-lg w-[90%] max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="p-2 border rounded bg-white dark:bg-[#003f50]"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="p-2 border rounded bg-white dark:bg-[#003f50]"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded bg-white dark:bg-[#003f50]"
          >
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
