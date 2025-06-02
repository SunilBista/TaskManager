import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  user: mongoose.Types.ObjectId;
  category: "high" | "medium" | "low";
  status: "pending" | "inprogress" | "completed";
  dueDate?: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    category: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          if (!value) return true;

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Due date must be today or in the future.",
      },
    },

    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>("task", TaskSchema);
