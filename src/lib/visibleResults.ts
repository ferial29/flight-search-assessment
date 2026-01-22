// src/lib/visibleResults.ts

export type SortMode = "best" | "cheapest" | "fastest";

export type Filters = {
  stops: number[]; // e.g. [0, 1, 2]  (your UI uses 2+ as 2)
  airlines: string[]; // airline codes
  priceMin: number | null;
  priceMax: number | null;
};

export type Flight = {
  id: string;
  airlineCode: string;
  stops: number;
  price: number;
  durationMins: number;
};

export function getVisibleResults(
  resultsRaw: Flight[],
  filters: Partial<Filters> | undefined,
  sort: SortMode
) {
  let list = [...(resultsRaw ?? [])];

  const stops = filters?.stops ?? [];
  const airlines = filters?.airlines ?? [];

  if (stops.length) {
    list = list.filter((r) => stops.includes(r.stops));
  }

  if (airlines.length) {
    list = list.filter((r) => airlines.includes(r.airlineCode));
  }

  const min = filters?.priceMin;
  if (min !== null && min !== undefined) {
    list = list.filter((r) => r.price >= min);
  }

  const max = filters?.priceMax;
  if (max !== null && max !== undefined) {
    list = list.filter((r) => r.price <= max);
  }

  if (sort === "cheapest") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "fastest") {
    list.sort((a, b) => a.durationMins - b.durationMins);
  } else {
    // "best" = balanced score
    list.sort((a, b) => {
      const scoreA = a.price * 0.6 + a.durationMins * 0.4;
      const scoreB = b.price * 0.6 + b.durationMins * 0.4;
      return scoreA - scoreB;
    });
  }

  return list;
}
