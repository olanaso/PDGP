import type { ReactNode } from "react";

export function ChartExplanation({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 flex max-w-3xl items-start gap-1.5 text-[10px] leading-4 text-slate-500">
      <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-700">
        Cómo leerlo
      </span>
      <span>{children}</span>
    </p>
  );
}
