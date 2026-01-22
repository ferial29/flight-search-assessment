"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function ResultsSummaryBar() {
  const results = useSearchStore((s) => s.resultsFiltered);
  const sortBy = useSearchStore((s) => s.sortBy);
  const setSortBy = useSearchStore((s) => s.setSortBy);

  const summary = useMemo(() => {
    if (!results.length) return { count: 0, cheapest: null as number | null, fastest: null as number | null };
    const cheapest = Math.min(...results.map((r) => r.price));
    const fastest = Math.min(...results.map((r) => r.durationMins));
    return { count: results.length, cheapest, fastest };
  }, [results]);

  const Tab = (key: "cheapest" | "fastest" | "best", label: string) => {
    const active = sortBy === key;
    return (
      <button
        type="button"
        onClick={() => setSortBy(key)}
        className={[
          "rounded-xl px-3 py-2 text-sm font-medium transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
          active
            ? "bg-zinc-900 text-white shadow-sm"
            : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-3 backdrop-blur">
      <div className="text-sm text-zinc-700">
        <span className="font-semibold text-zinc-900">{summary.count}</span> results
        {summary.cheapest !== null ? (
          <>
            {" "}• Cheapest <span className="font-semibold text-zinc-900">${summary.cheapest}</span>
          </>
        ) : null}
        {summary.fastest !== null ? (
          <>
            {" "}• Fastest <span className="font-semibold text-zinc-900">{formatDuration(summary.fastest)}</span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {Tab("best", "Best")}
        {Tab("cheapest", "Cheapest")}
        {Tab("fastest", "Fastest")}
      </div>
    </div>
  );
}
