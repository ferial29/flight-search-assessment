import { create } from "zustand";
import type { SearchFormValues } from "@/components/search/schema";

export type FlightResult = {
  id: string;
  airline: string; // e.g. "Oman Air"
  airlineCode: string; // e.g. "WY"
  stops: number; // 0, 1, 2...
  price: number; // numeric, e.g. 120.5
  currency: string; // e.g. "USD"
  departTime: string; // "08:15"
  arriveTime: string; // "12:40"
  durationMins: number; // total duration in minutes
};

export type FiltersState = {
  stops: Array<0 | 1 | 2>; // 2 represents "2+"
  airlines: string[]; // airline codes
  priceMin: number | null;
  priceMax: number | null;
};

export type SortBy = "cheapest" | "fastest" | "best";

type SearchState = {
  // Last submitted search (used later for API requests and URL sync)
  searchParams: SearchFormValues | null;

  // Raw results (unfiltered)
  resultsRaw: FlightResult[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: FiltersState;

  // Sorting
  sortBy: SortBy;

  // Actions
  setSearchParams: (params: SearchFormValues) => void;
  setResultsRaw: (results: FlightResult[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;

  setStops: (stops: FiltersState["stops"]) => void;
  toggleAirline: (airlineCode: string) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  resetFilters: () => void;

  setSortBy: (v: SortBy) => void;
};

const defaultFilters: FiltersState = {
  stops: [0, 1, 2],
  airlines: [],
  priceMin: null,
  priceMax: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  searchParams: null,
  resultsRaw: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,
  sortBy: "cheapest",

  setSearchParams: (params) => set({ searchParams: params }),
  setResultsRaw: (results) => set({ resultsRaw: results }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),

  setStops: (stops) => set((s) => ({ filters: { ...s.filters, stops } })),

  toggleAirline: (airlineCode) =>
    set((s) => {
      const exists = s.filters.airlines.includes(airlineCode);
      return {
        filters: {
          ...s.filters,
          airlines: exists
            ? s.filters.airlines.filter((x) => x !== airlineCode)
            : [...s.filters.airlines, airlineCode],
        },
      };
    }),

  setPriceRange: (min, max) =>
    set((s) => ({ filters: { ...s.filters, priceMin: min, priceMax: max } })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSortBy: (v) => set({ sortBy: v }),
}));
