import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  busy: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, busy, onToggle, onEdit, onDelete }: TaskItemProps) {
  const checkboxId = `task-check-${task.id}`;

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-xs transition hover:shadow-md sm:p-5 ${
        task.completed ? "border-emerald-200/80" : "border-slate-200"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 start-0 w-1 ${task.completed ? "bg-emerald-500" : "bg-indigo-500"}`}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <input
            id={checkboxId}
            type="checkbox"
            checked={task.completed}
            disabled={busy}
            onChange={() => onToggle(task)}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor={checkboxId}
                className={`cursor-pointer break-words text-base font-semibold ${
                  task.completed ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {task.title}
              </label>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.completed ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {task.completed ? "انجام شده" : "در جریان"}
              </span>
            </div>

            {task.description ? (
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {task.description}
              </p>
            ) : null}

            <dl className="mt-3 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:gap-4">
              <div className="flex gap-1">
                <dt>ایجاد:</dt>
                <dd>{formatDate(task.created_at)}</dd>
              </div>
              <div className="flex gap-1">
                <dt>آخرین ویرایش:</dt>
                <dd>{formatDate(task.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => onEdit(task)}
            aria-label={`ویرایش ${task.title}`}
            className="flex-1"
          >
            ویرایش
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={busy}
            onClick={() => onDelete(task)}
            aria-label={`حذف ${task.title}`}
            className="flex-1"
          >
            حذف
          </Button>
        </div>
      </div>
    </li>
  );
}