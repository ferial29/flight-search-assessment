import type { FlightResult } from "@/store/searchStore";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function stopsLabel(stops: number) {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return "2+ stops";
}

export function ResultCard({ item }: { item: FlightResult }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100">
            {item.airline} <span className="text-zinc-500">({item.airlineCode})</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {stopsLabel(item.stops)} • {formatDuration(item.durationMins)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-zinc-50">
            {item.price} {item.currency}
          </p>
          <p className="mt-1 text-xs text-zinc-500">per adult</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
          <p className="text-[11px] text-zinc-500">Departure</p>
          <p className="text-sm text-zinc-100">{item.departTime}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
          <p className="text-[11px] text-zinc-500">Arrival</p>
          <p className="text-sm text-zinc-100">{item.arriveTime}</p>
        </div>
      </div>
    </div>
  );
}
