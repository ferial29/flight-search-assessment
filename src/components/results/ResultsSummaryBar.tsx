"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function ResultsSummaryBar() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  // Derive the same filtered dataset used by the results list (single source of truth)
  const filtered = useMemo(() => {
    let list = [...resultsRaw];

    // Stops
    list = list.filter((r) => filters.stops.includes(r.stops as any));

    // Airlines (if none selected, allow all)
    if (filters.airlines.length > 0) {
      list = list.filter((r) => filters.airlines.includes(r.airlineCode));
    }

    // Price range
    if (filters.priceMin != null) list = list.filter((r) => r.price >= filters.priceMin);
    if (filters.priceMax != null) list = list.filter((r) => r.price <= filters.priceMax);

    return list;
  }, [resultsRaw, filters]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const cheapest = Math.min(...filtered.map((r) => r.price));
    const fastest = Math.min(...filtered.map((r) => r.durationMins));
    return { count: filtered.length, cheapest, fastest };
  }, [filtered]);

  if (!stats) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2">
      {/* Summary */}
      <p className="text-xs text-zinc-300">
        <span className="font-medium text-zinc-100">{stats.count}</span> results •
        Cheapest <span className="text-zinc-100">${stats.cheapest}</span> •
        Fastest <span className="text-zinc-100">{formatDuration(stats.fastest)}</span>
      </p>

      {/* Sort controls */}
      <div className="flex items-center gap-1">
        {[
          { key: "cheapest", label: "Cheapest" },
          { key: "fastest", label: "Fastest" },
          { key: "best", label: "Best" },
        ].map((opt) => {
          const active = sortBy === (opt.key as any);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key as any)}
              className={[
                "h-8 rounded-lg px-3 text-xs transition",
                active ? "bg-zinc-100 text-zinc-950" : "text-zinc-300 hover:bg-zinc-900",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
