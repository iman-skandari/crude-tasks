import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
}

export function Select({ id, label, className = "", children, ...rest }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}