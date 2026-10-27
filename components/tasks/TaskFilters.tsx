import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { StatusFilter } from "@/hooks/useTasks";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  onCreate: () => void;
}

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "active", label: "انجام نشده" },
  { value: "done", label: "انجام شده" },
];

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onCreate,
}: TaskFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <Field
            id="task-search"
            label="جستجو در عنوان و توضیحات"
            type="search"
            placeholder="جستجو..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <fieldset className="min-w-0 lg:w-80">
          <legend className="mb-1.5 block text-sm font-medium text-slate-700">وضعیت</legend>
          <div className="flex rounded-xl bg-slate-100 p-1">
            {OPTIONS.map((option) => {
              const active = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onStatusChange(option.value)}
                  className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Button onClick={onCreate} className="lg:py-3">
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          تسک جدید
        </Button>
      </div>
    </div>
  );
}