"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useSearchStore } from "@/store/searchStore";

export default function PriceChart() {
  const results = useSearchStore((s) => s.resultsFiltered);

  const data = useMemo(() => results.map((r, i) => ({ idx: i + 1, price: r.price })), [results]);

  if (!data.length) {
    return (
      <div className="flex h-44 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-600">
        No chart data yet. Run a search or adjust filters.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Price Trend</div>
          <div className="mt-1 text-xs text-zinc-500">Reflects the currently filtered results</div>
        </div>
      </div>

      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 6" />
            <XAxis dataKey="idx" hide />
            <YAxis width={40} />
            <Tooltip
              formatter={(value: number) => [`$${value}`, "Price"]}
              labelFormatter={(label) => `Result ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
