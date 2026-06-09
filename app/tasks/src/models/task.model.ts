import { prop, getModelForClass, modelOptions, index } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import type { TaskPriority } from "~/tasks/types";

export type { TaskPriority };

@modelOptions({
  schemaOptions: {
    collection: "tbl_tasks",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
})
@index({ createdAt: -1 })
export class Task extends TimeStamps {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: Date, required: false })
  dueDate?: Date | null;

  @prop({ type: String, required: true, enum: ["high", "medium", "low"], default: "medium" })
  priority!: TaskPriority;

  @prop({ type: Boolean, required: true, default: false })
  completed!: boolean;

  @prop({ type: Date, required: false })
  completedAt?: Date | null;
}

export const TaskModel = getModelForClass(Task);
