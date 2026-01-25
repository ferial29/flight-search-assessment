"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/store/searchStore";

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

export function ResultsList() {
  // ✅ Use store-computed visible results (already filtered & sorted)
  const results = useSearchStore((s) => s.resultsFiltered);

  const isLoading = useSearchStore((s) => s.isLoading);
  const error = useSearchStore((s) => s.error);

  // ✅ selection
  const selectedResultId = useSearchStore((s) => s.selectedResultId);
  const setSelectedResultId = useSearchStore((s) => s.setSelectedResultId);

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

  if (!results?.length) {
    return (
      <Card className="p-4">
        <p className="text-sm text-zinc-500">No results found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r) => {
        const isSelected = selectedResultId === r.id;

        return (
          <Card
            key={r.id}
            className={cn(
              "p-4 transition",
              isSelected && "ring-2 ring-zinc-300"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {r.airline}
                  </p>

                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                    {r.airlineCode}
                  </span>

                  {isSelected ? (
                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white">
                      Selected
                    </span>
                  ) : null}
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

                {/* ✅ Select button */}
                <button
                  type="button"
                  onClick={() => setSelectedResultId(isSelected ? null : r.id)}
                  className={cn(
                    "mt-2 h-9 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60",
                    isSelected
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 hover:shadow-sm hover:-translate-y-[1px] active:bg-zinc-400 active:translate-y-0"
                  )}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
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
        );
      })}
    </div>
  );
}
