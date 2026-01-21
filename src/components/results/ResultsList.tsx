"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";
import { ResultCard } from "./ResultCard";

export function ResultsList() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const isLoading = useSearchStore((s) => s.isLoading);
  const error = useSearchStore((s) => s.error);
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);

  // Apply all filters simultaneously (core requirement)
  const resultsFiltered = useMemo(() => {
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

    // Sorting
    if (sortBy === "cheapest") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "fastest") {
      list.sort((a, b) => a.durationMins - b.durationMins);
    } else {
      // "Best": simple weighted score (price + duration)
      list.sort(
        (a, b) => a.price + a.durationMins * 0.5 - (b.price + b.durationMins * 0.5)
      );
    }

    return list;
  }, [resultsRaw, filters, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 rounded-2xl border border-zinc-800 bg-zinc-950/40" />
        <div className="h-24 rounded-2xl border border-zinc-800 bg-zinc-950/40" />
        <div className="h-24 rounded-2xl border border-zinc-800 bg-zinc-950/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (resultsRaw.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm text-zinc-300">No results yet. Run a search.</p>
      </div>
    );
  }

  if (resultsFiltered.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm text-zinc-300">No matches. Try relaxing filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-400">
        Showing <span className="text-zinc-200">{resultsFiltered.length}</span> results
      </p>

      {resultsFiltered.map((item) => (
        <ResultCard key={item.id} item={item} />
      ))}
    </div>
  );
}
