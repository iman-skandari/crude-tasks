import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-l from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50",
  danger: "bg-rose-600 text-white shadow-md shadow-rose-500/25 hover:bg-rose-700",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    />
  );
}