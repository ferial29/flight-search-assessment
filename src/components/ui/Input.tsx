import { forwardRef, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={[
          "h-10 w-full rounded-xl border border-zinc-800",
          "bg-zinc-900 px-3 text-sm text-zinc-100",
          "placeholder:text-zinc-500",
          "focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/40",
          className,
        ].join(" ")}
      />
    );
  }
);

Input.displayName = "Input";
