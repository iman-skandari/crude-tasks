import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField({ id, label, error, hint, className = "", ...rest }, ref) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
          } ${className}`}
          {...rest}
        />
        {hint ? (
          <p id={hintId} className="text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-sm text-rose-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);