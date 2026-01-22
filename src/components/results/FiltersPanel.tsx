"use client";

import { useMemo, useState } from "react";
import { useSearchStore } from "@/store/searchStore";

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
        active
          ? "bg-zinc-900 text-white shadow-sm"
          : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function FiltersPanel() {
  const filters = useSearchStore((s) => s.filters);
  const setStops = useSearchStore((s) => s.setStops);
  const toggleAirline = useSearchStore((s) => s.toggleAirline);
  const setPriceRange = useSearchStore((s) => s.setPriceRange);
  const resetFilters = useSearchStore((s) => s.resetFilters);

  const raw = useSearchStore((s) => s.resultsRaw);

  const { minAvailable, maxAvailable, airlinesAvailable } = useMemo(() => {
    if (!raw.length) {
      return {
        minAvailable: 0,
        maxAvailable: 0,
        airlinesAvailable: [] as { code: string; name: string; count: number }[],
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    const map = new Map<string, { code: string; name: string; count: number }>();
    for (const r of raw) {
      if (r.price < min) min = r.price;
      if (r.price > max) max = r.price;

      const prev = map.get(r.airlineCode);
      if (prev) prev.count += 1;
      else map.set(r.airlineCode, { code: r.airlineCode, name: r.airline, count: 1 });
    }

    return {
      minAvailable: Number.isFinite(min) ? min : 0,
      maxAvailable: Number.isFinite(max) ? max : 0,
      airlinesAvailable: Array.from(map.values()).sort((a, b) => b.count - a.count),
    };
  }, [raw]);

  const [minInput, setMinInput] = useState<string>(filters.priceMin?.toString() ?? "");
  const [maxInput, setMaxInput] = useState<string>(filters.priceMax?.toString() ?? "");

  const applyPrice = () => {
    const min = minInput.trim() === "" ? null : Number(minInput);
    const max = maxInput.trim() === "" ? null : Number(maxInput);

    setPriceRange(
      Number.isFinite(min as number) ? (min as number) : null,
      Number.isFinite(max as number) ? (max as number) : null
    );
  };

  const toggleStop = (v: 0 | 1 | 2) => {
    const has = filters.stops.includes(v);
    const next = has ? filters.stops.filter((x) => x !== v) : [...filters.stops, v];
    const safe = next.length ? (next as Array<0 | 1 | 2>) : ([0, 1, 2] as Array<0 | 1 | 2>);
    setStops(safe);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Filters</div>
          <div className="mt-1 text-xs text-zinc-500">Updates results & chart instantly</div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetFilters();
            setMinInput("");
            setMaxInput("");
          }}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          Reset
        </button>
      </div>

      {/* Stops */}
      <div>
        <div className="mb-2 text-xs font-semibold text-zinc-700">Stops</div>
        <div className="flex flex-wrap gap-2">
          <Pill active={filters.stops.includes(0)} onClick={() => toggleStop(0)}>Non-stop</Pill>
          <Pill active={filters.stops.includes(1)} onClick={() => toggleStop(1)}>1 stop</Pill>
          <Pill active={filters.stops.includes(2)} onClick={() => toggleStop(2)}>2+ stops</Pill>
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-700">Price</div>
          <div className="text-xs text-zinc-500">
            {minAvailable} – {maxAvailable} USD
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Min"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Max"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={applyPrice}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            Apply
          </button>
          <div className="text-xs text-zinc-500">Tip: leave empty for no limit</div>
        </div>
      </div>

      {/* Airlines */}
      <div>
        <div className="mb-2 text-xs font-semibold text-zinc-700">Airlines</div>

        {!airlinesAvailable.length ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
            Run a search to load airlines.
          </div>
        ) : (
          <div className="max-h-[320px] space-y-2 overflow-auto pr-1">
            {airlinesAvailable.map((a) => {
              const checked = filters.airlines.includes(a.code);
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => toggleAirline(a.code)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                    checked
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate text-zinc-900">
                    {a.name} <span className="text-zinc-500">({a.code})</span>
                  </span>
                  <span className="ml-3 shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                    {a.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
