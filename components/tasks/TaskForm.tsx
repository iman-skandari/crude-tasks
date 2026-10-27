"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextareaField } from "@/components/ui/TextareaField";
import { getErrorMessage } from "@/lib/api";
import { createTask, replaceTask } from "@/lib/services";
import type { Task } from "@/types";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان الزامی است")
    .max(120, "عنوان نباید بیشتر از ۱۲۰ کاراکتر باشد"),
  description: z.string().max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد"),
  completed: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  task?: Task;
  onSaved: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSaved, onCancel }: TaskFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      completed: task?.completed ?? false,
    },
  });

  const descriptionLength = watch("description")?.length ?? 0;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (task) {
        await replaceTask(task.id, values);
      } else {
        await createTask(values);
      }
      onSaved();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        id="task-title"
        label="عنوان"
        error={errors.title?.message}
        {...register("title")}
      />
      <TextareaField
        id="task-description"
        label="توضیحات"
        rows={5}
        hint={`${descriptionLength} / 2000`}
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="flex items-center gap-2">
        <input
          id="task-completed"
          type="checkbox"
          className="h-4 w-4 accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          {...register("completed")}
        />
        <label htmlFor="task-completed" className="text-sm text-slate-700">
          انجام شده
        </label>
      </div>

      {submitError ? <Alert kind="error">{submitError}</Alert> : null}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          انصراف
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ذخیره..." : task ? "ذخیره تغییرات" : "ایجاد تسک"}
        </Button>
      </div>
    </form>
  );
}