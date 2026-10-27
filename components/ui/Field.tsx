import { forwardRef, type InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, id, className = "", ...rest },
  ref
) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-sm text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});