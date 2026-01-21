"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import { useSearchStore } from "@/store/searchStore";

type ChartPoint = {
  index: number;
  price: number;
};

export function PriceChart() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);
  const sortBy = useSearchStore((s) => s.sortBy);

  // Reuse the same filtering + sorting logic (single source of truth)
  const chartData: ChartPoint[] = useMemo(() => {
    let list = [...resultsRaw];

    // Filters
    list = list.filter((r) => filters.stops.includes(r.stops as any));

    if (filters.airlines.length > 0) {
      list = list.filter((r) => filters.airlines.includes(r.airlineCode));
    }

    if (filters.priceMin != null) {
      list = list.filter((r) => r.price >= filters.priceMin);
    }
    if (filters.priceMax != null) {
      list = list.filter((r) => r.price <= filters.priceMax);
    }

    // Sorting (same as ResultsList)
    if (sortBy === "cheapest") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "fastest") {
      list.sort((a, b) => a.durationMins - b.durationMins);
    } else {
      list.sort(
        (a, b) =>
          a.price + a.durationMins * 0.5 -
          (b.price + b.durationMins * 0.5)
      );
    }

    return list.map((r, i) => ({
      index: i + 1,
      price: r.price,
    }));
  }, [resultsRaw, filters, sortBy]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm text-zinc-400">
          No data to display. Adjust filters or run a search.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            label={{
              value: "Result index",
              position: "insideBottom",
              offset: -5,
              fill: "#a1a1aa",
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            label={{
              value: "Price (USD)",
              angle: -90,
              position: "insideLeft",
              fill: "#a1a1aa",
              fontSize: 11,
            }}
          />
          <Tooltip
            contentStyle={{
              background: "#09090b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => [`$${value}`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e5e7eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
