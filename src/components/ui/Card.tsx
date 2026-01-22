import * as React from "react";

type CardProps = React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}>;

export function Card({ title, subtitle, right, className = "", children }: CardProps) {
  return (
    <section
      className={[
        "relative rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm",
        "pointer-events-auto",
        className,
      ].join(" ")}
    >
      {(title || subtitle || right) ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-base font-semibold text-zinc-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </header>
      ) : null}

      <div className="pointer-events-auto">{children}</div>
    </section>
  );
}
