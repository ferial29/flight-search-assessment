"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Card } from "@/components/ui/Card";
import { useSearchStore } from "@/store/searchStore";

type Point = {
  idx: number; // 1..N
  price: number;
};

export function PriceChart() {
  const resultsRaw = useSearchStore((s) => s.resultsRaw);
  const filters = useSearchStore((s) => s.filters);

  const data: Point[] = useMemo(() => {
    const raw = Array.isArray(resultsRaw) ? resultsRaw : [];
    if (raw.length === 0) return [];

    // Start with a copy (we'll progressively filter it)
    let list = [...raw];

    // Stops filter: 2 represents "2+"
    if (filters?.stops?.length) {
      list = list.filter((r) => {
        if (r.stops === 0) return filters.stops.includes(0);
        if (r.stops === 1) return filters.stops.includes(1);
        return filters.stops.includes(2);
      });
    }

    // Airlines filter (airlineCode)
    if (filters?.airlines?.length) {
      const set = new Set(filters.airlines);
      list = list.filter((r) => set.has(r.airlineCode));
    }

    // Price range
    if (filters?.priceMin != null) {
      const min = filters.priceMin;
      list = list.filter((r) => r.price >= min);
    }
    if (filters?.priceMax != null) {
      const max = filters.priceMax;
      list = list.filter((r) => r.price <= max);
    }

    if (list.length === 0) return [];

    // Convert results -> sorted prices (ascending)
    const prices = list
      .map((r) => r.price)
      .filter((p) => Number.isFinite(p))
      .sort((a, b) => a - b);

    if (prices.length === 0) return [];

    // Make the chart look nicer even with few results:
    // Insert 2 intermediate points between each adjacent price.
    // This is a visual interpolation only (doesn't change result list).
    const expanded: number[] = [];
    for (let i = 0; i < prices.length - 1; i++) {
      const a = prices[i];
      const b = prices[i + 1];

      expanded.push(Math.round(a));

      const mid1 = a + (b - a) * 0.33;
      const mid2 = a + (b - a) * 0.66;

      expanded.push(Math.round(mid1));
      expanded.push(Math.round(mid2));
    }
    expanded.push(Math.round(prices[prices.length - 1]));

    // Optional: cap max points to keep it readable
    const MAX_POINTS = 60;
    const sliced =
      expanded.length > MAX_POINTS
        ? expanded.filter((_, i) => i % Math.ceil(expanded.length / MAX_POINTS) === 0)
        : expanded;

    return sliced.map((price, i) => ({
      idx: i + 1,
      price,
    }));
  }, [resultsRaw, filters]);

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zinc-900">Price Trend</h3>
        <p className="text-xs text-zinc-500">
          Updates instantly based on filters
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500">
          No data to display. Run a search or adjust filters.
        </div>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="idx"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={40}
              />
              <Tooltip
                // Recharts formatter expects: (value, name, props) => string | number | [string | number, string]
                formatter={(value) => [`$${value}`, "Price"]}
                labelFormatter={(label) => `Point ${label}`}
              />
              <Line
                type="monotone"
                dataKey="price"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
export default PriceChart;
