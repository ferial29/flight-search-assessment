type Option<T extends string> = {
    label: string;
    value: T;
  };
  
  type SegmentedProps<T extends string> = {
    value: T;
    options: Option<T>[];
    onChange: (v: T) => void;
  };
  
  export function Segmented<T extends string>({
    value,
    options,
    onChange,
  }: SegmentedProps<T>) {
    return (
      <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-900 p-1">
        {options.map((opt) => {
          const active = opt.value === value;
  
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "h-8 rounded-lg px-4 text-xs transition",
                active
                  ? "bg-zinc-100 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
  