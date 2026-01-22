"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";
import type { FlightResult } from "@/store/searchStore";
import { cn } from "@/lib/utils";

type Props = {
  isLoading?: boolean;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function applyFiltersAndSort(
  results: FlightResult[],
  filters: ReturnType<typeof useSearchStore>["filters"],
  sortBy: ReturnType<typeof useSearchStore>["sortBy"]
) {
  let list = Array.isArray(results) ? [...results] : [];

  // Stops
  if (filters.stops?.length) {
    list = list.filter((r) => {
      if (r.stops === 0) return filters.stops.includes(0);
      if (r.stops === 1) return filters.stops.includes(1);
      return filters.stops.includes(2); // 2 = "2+"
    });
  }

  // Airlines
  if (filters.airlines?.length) {
    list = list.filter((r) => filters.airlines.includes(r.airlineCode));
  }

  // Price range
  if (filters.priceMin != null) {
    list = list.filter((r) => r.price >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    list = list.filter((r) => r.price <= filters.priceMax!);
  }

  // Sorting
  if (sortBy === "cheapest") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "fastest") {
    list.sort((a, b) => a.durationMins - b.durationMins);
  } else {
    // "best": simple heuristic: weighted score
    list.sort((a, b) => {
      const scoreA = a.price * 0.65 + a.durationMins * 0.35;
      const scoreB = b.price * 0.65 + b.durationMins * 0.35;
      return scoreA - scoreB;
    });
  }

  return list;
}

export function ResultsList({ isLoading }: Props) {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);

  const results = useMemo(() => {
    return applyFiltersAndSort(resultsRaw, filters, sortBy);
  }, [resultsRaw, filters, sortBy]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        Loading results…
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        No results. Try changing the search or filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900">{r.airline}</p>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                  {r.airlineCode}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {r.stops === 0 ? "Non-stop" : r.stops === 1 ? "1 stop" : "2+ stops"} •{" "}
                {formatDuration(r.durationMins)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-zinc-900">
                {Math.round(r.price)} <span className="text-sm font-semibold">{r.currency}</span>
              </p>
              <p className="text-xs text-zinc-500">per adult</p>
            </div>
          </div>

          {/* Time boxes */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "min-w-[140px] rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2",
                  "h-[56px] flex flex-col justify-center"
                )}
              >
                <p className="text-[11px] font-medium text-zinc-500">Departure</p>
                <p className="text-sm font-semibold text-zinc-900">{r.departTime}</p>
              </div>

              <div
                className={cn(
                  "min-w-[140px] rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2",
                  "h-[56px] flex flex-col justify-center"
                )}
              >
                <p className="text-[11px] font-medium text-zinc-500">Arrival</p>
                <p className="text-sm font-semibold text-zinc-900">{r.arriveTime}</p>
              </div>
            </div>

            <button className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]">
              Select
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
