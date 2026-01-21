import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      {title && (
        <h3 className="mb-3 text-sm font-medium text-zinc-200">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
