import type { ReactNode } from "react";

interface CardProps {
  id: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function Card({ id, title, aside, children }: CardProps) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h3 id={id} className="flex items-center gap-2 text-base font-bold text-slate-900">
          <span aria-hidden="true" className="h-5 w-1.5 rounded-full bg-linear-to-b from-indigo-500 to-violet-500" />
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}