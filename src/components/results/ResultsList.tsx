"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  useSearchStore,
  type FlightResult,
  type FiltersState,
  type SortBy,
} from "@/store/searchStore";

function formatStops(stops: number) {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return "2+ stops";
}

function formatDuration(totalMins: number) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
}

function applyFiltersAndSort(
  results: FlightResult[],
  filters: FiltersState,
  sortBy: SortBy
) {
  let list = Array.isArray(results) ? [...results] : [];

  // Stops filter (0, 1, 2 => 2+)
  if (filters?.stops?.length) {
    const stopsSelected = filters.stops;
    list = list.filter((r) => {
      const bucket = r.stops >= 2 ? 2 : (r.stops as 0 | 1 | 2);
      return stopsSelected.includes(bucket);
    });
  }

  // Airlines filter (codes)
  if (filters?.airlines?.length) {
    const airlineCodes = filters.airlines;
    list = list.filter((r) => airlineCodes.includes(r.airlineCode));
  }

  // Price range (IMPORTANT: store in const to satisfy TS narrowing)
  const min = filters?.priceMin;
  if (min != null) {
    list = list.filter((r) => r.price >= min);
  }

  const max = filters?.priceMax;
  if (max != null) {
    list = list.filter((r) => r.price <= max);
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy === "cheapest") return a.price - b.price;
    if (sortBy === "fastest") return a.durationMins - b.durationMins;

    // "best": simple weighted score (price + duration)
    const scoreA = a.price * 0.7 + a.durationMins * 0.3;
    const scoreB = b.price * 0.7 + b.durationMins * 0.3;
    return scoreA - scoreB;
  });

  return list;
}

export function ResultsList() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);
  const isLoading = useSearchStore((s) => s.isLoading);
  const error = useSearchStore((s) => s.error);

  const results = useMemo(
    () => applyFiltersAndSort(resultsRaw ?? [], filters, sortBy),
    [resultsRaw, filters, sortBy]
  );

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-zinc-500">Loading results…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!results.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-zinc-500">No results found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {r.airline}
                </p>
                <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                  {r.airlineCode}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {formatStops(r.stops)} • {formatDuration(r.durationMins)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">
                {Math.round(r.price)} {r.currency}
              </p>
              <p className="text-xs text-zinc-500">per adult</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-xl border border-zinc-200 bg-white px-3 py-2",
                "min-h-[52px]"
              )}
            >
              <p className="text-xs text-zinc-500">Departure</p>
              <p className="text-sm font-semibold text-zinc-900">
                {r.departTime}
              </p>
            </div>

            <div
              className={cn(
                "rounded-xl border border-zinc-200 bg-white px-3 py-2",
                "min-h-[52px]"
              )}
            >
              <p className="text-xs text-zinc-500">Arrival</p>
              <p className="text-sm font-semibold text-zinc-900">
                {r.arriveTime}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
