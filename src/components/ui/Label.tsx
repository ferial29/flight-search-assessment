import { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={[
        "mb-1 block text-xs font-medium text-zinc-400",
        className,
      ].join(" ")}
    />
  );
}
