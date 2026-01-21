"use client";

import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

export function FiltersPanel() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);

  const setStops = useSearchStore((s) => s.setStops);
  const toggleAirline = useSearchStore((s) => s.toggleAirline);
  const setPriceRange = useSearchStore((s) => s.setPriceRange);
  const resetFilters = useSearchStore((s) => s.resetFilters);

  // Derive airlines list from API results
  const airlineOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of resultsRaw) {
      if (!map.has(r.airlineCode)) map.set(r.airlineCode, r.airline);
    }
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [resultsRaw]);

  // Derive price range info (helpful UX)
  const priceStats = useMemo(() => {
    if (resultsRaw.length === 0) return { min: 0, max: 0 };
    const prices = resultsRaw.map((r) => r.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [resultsRaw]);

  const toggleStop = (stop: 0 | 1 | 2) => {
    const exists = filters.stops.includes(stop);
    const next = exists
      ? filters.stops.filter((s) => s !== stop)
      : [...filters.stops, stop];

    // Keep at least one stop option selected (better UX)
    if (next.length === 0) return;
    setStops(next as any);
  };

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          Update results instantly (list + chart)
        </p>

        <button
          type="button"
          onClick={resetFilters}
          className="h-8 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {/* Stops */}
      <div className="space-y-2">
        <Label>Stops</Label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleStop(0)}
            className={[
              "h-9 rounded-xl border px-3 text-xs transition",
              filters.stops.includes(0)
                ? "border-zinc-600 bg-zinc-100 text-zinc-950"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
            ].join(" ")}
          >
            Non-stop
          </button>

          <button
            type="button"
            onClick={() => toggleStop(1)}
            className={[
              "h-9 rounded-xl border px-3 text-xs transition",
              filters.stops.includes(1)
                ? "border-zinc-600 bg-zinc-100 text-zinc-950"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
            ].join(" ")}
          >
            1 stop
          </button>

          <button
            type="button"
            onClick={() => toggleStop(2)}
            className={[
              "h-9 rounded-xl border px-3 text-xs transition",
              filters.stops.includes(2)
                ? "border-zinc-600 bg-zinc-100 text-zinc-950"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
            ].join(" ")}
          >
            2+ stops
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label>Price (USD)</Label>
        <p className="text-xs text-zinc-500">
          Available: {priceStats.min} – {priceStats.max}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Min"
            inputMode="numeric"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              setPriceRange(
                e.target.value ? Number(e.target.value) : null,
                filters.priceMax
              )
            }
          />
          <Input
            placeholder="Max"
            inputMode="numeric"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              setPriceRange(
                filters.priceMin,
                e.target.value ? Number(e.target.value) : null
              )
            }
          />
        </div>
      </div>

      {/* Airlines */}
      <div className="space-y-2">
        <Label>Airlines</Label>

        {airlineOptions.length === 0 ? (
          <p className="text-sm text-zinc-500">Run a search to see airlines.</p>
        ) : (
          <div className="space-y-2">
            {airlineOptions.map((a) => {
              const checked = filters.airlines.includes(a.code);
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => toggleAirline(a.code)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition",
                    checked
                      ? "border-zinc-600 bg-zinc-100 text-zinc-950"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                  ].join(" ")}
                >
                  <span className="truncate">
                    {a.name} <span className="text-zinc-500">({a.code})</span>
                  </span>

                  <span
                    className={[
                      "h-4 w-4 rounded border",
                      checked
                        ? "border-zinc-950 bg-zinc-950"
                        : "border-zinc-600",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
