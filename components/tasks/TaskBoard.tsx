"use client";

import { useState } from "react";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTasks } from "@/hooks/useTasks";
import { getErrorMessage } from "@/lib/api";
import { deleteTask, fetchTask, patchTask } from "@/lib/services";
import type { Task } from "@/types";

type FormState = { mode: "create" } | { mode: "edit"; task: Task } | null;

interface Notice {
  kind: "error" | "success";
  text: string;
}

export function TaskBoard() {
  const { tasks, loading, error, search, setSearch, status, setStatus, reload, retry } =
    useTasks();
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const hasFilters = search.trim() !== "" || status !== "all";

  const handleToggle = async (task: Task) => {
    setBusyId(task.id);
    setNotice(null);
    try {
      await patchTask(task.id, { completed: !task.completed });
      await reload();
    } catch (err) {
      setNotice({ kind: "error", text: getErrorMessage(err) });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const handleEdit = async (task: Task) => {
    setBusyId(task.id);
    setNotice(null);
    try {
      const fresh = await fetchTask(task.id);
      setFormState({ mode: "edit", task: fresh });
    } catch (err) {
      setNotice({ kind: "error", text: getErrorMessage(err) });
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = async () => {
    const wasEdit = formState?.mode === "edit";
    setFormState(null);
    setNotice({
      kind: "success",
      text: wasEdit ? "تسک با موفقیت ویرایش شد." : "تسک با موفقیت ایجاد شد.",
    });
    await reload();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setNotice({ kind: "success", text: "تسک حذف شد." });
    } catch (err) {
      setNotice({ kind: "error", text: getErrorMessage(err) });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
      await reload();
    }
  };

  const formKey =
    formState?.mode === "edit" ? `edit-${formState.task.id}-${formState.task.updated_at}` : "create";

  return (
    <div className="space-y-4">
      <Alert kind="info">
        تسک‌ها یک ساعت پس از ایجاد یا آخرین ویرایش منقضی می‌شوند و هر ورود جدید، مجموعه‌ی تسک‌های
        جدایی دارد.
      </Alert>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onCreate={() => setFormState({ mode: "create" })}
      />

      {notice ? (
        <Alert kind={notice.kind} onDismiss={() => setNotice(null)}>
          {notice.text}
        </Alert>
      ) : null}

      {error ? (
        <Alert kind="error">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{error}</span>
            <Button variant="secondary" onClick={retry}>
              تلاش دوباره
            </Button>
          </div>
        </Alert>
      ) : null}

      <div aria-busy={loading}>
        {loading ? (
          <>
            <span className="sr-only" role="status">
              در حال بارگذاری تسک‌ها...
            </span>
            <ul className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <li key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
              ))}
            </ul>
          </>
        ) : tasks.length === 0 && !error ? (
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-14 text-center">
            <p className="text-base font-semibold text-slate-700">
              {hasFilters ? "نتیجه‌ای پیدا نشد" : "هنوز تسکی وجود ندارد"}
            </p>
            <p className="text-sm text-slate-500">
              {hasFilters
                ? "عبارت جستجو یا فیلتر را تغییر دهید."
                : "با دکمه‌ی «تسک جدید» اولین تسک را بسازید."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                busy={busyId === task.id}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={formState !== null}
        title={formState?.mode === "edit" ? "ویرایش تسک" : "تسک جدید"}
        onClose={() => setFormState(null)}
      >
        <TaskForm
          key={formKey}
          task={formState?.mode === "edit" ? formState.task : undefined}
          onSaved={handleSaved}
          onCancel={() => setFormState(null)}
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="حذف تسک"
        onClose={() => (deleting ? undefined : setDeleteTarget(null))}
      >
        <p className="mb-4 break-words text-sm text-slate-700">
          آیا از حذف «{deleteTarget?.title}» مطمئن هستید؟ این کار قابل بازگشت نیست.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? "در حال حذف..." : "حذف"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}