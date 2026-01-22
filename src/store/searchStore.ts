import { create } from "zustand";
import type { SearchFormValues } from "@/components/search/schema";
import { getVisibleResults } from "@/lib/visibleResults";

export type FlightResult = {
  id: string;
  airline: string;
  airlineCode: string;
  stops: number; // 0, 1, 2...
  price: number;
  currency: string;
  departTime: string;
  arriveTime: string;
  durationMins: number;
};

export type FiltersState = {
  stops: Array<0 | 1 | 2>;
  airlines: string[];
  priceMin: number | null;
  priceMax: number | null;
};

export type SortBy = "cheapest" | "fastest" | "best";

type SearchState = {
  searchParams: SearchFormValues | null;

  resultsRaw: FlightResult[];
  resultsFiltered: FlightResult[];

  isLoading: boolean;
  error: string | null;

  filters: FiltersState;
  sortBy: SortBy;

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

export const useSearchStore = create<SearchState>((set, get) => {
  const recompute = () => {
    const s = get();
    const raw = s.resultsRaw ?? [];
    const filters = s.filters ?? defaultFilters;
    const sortBy = s.sortBy ?? "best";

    const next = getVisibleResults(raw as any, filters as any, sortBy as any) as FlightResult[];
    set({ resultsFiltered: next });
  };

  return {
    searchParams: null,

    resultsRaw: [],
    resultsFiltered: [],

    isLoading: false,
    error: null,

    filters: defaultFilters,
    sortBy: "best",

    setSearchParams: (params) => set({ searchParams: params }),

    setResultsRaw: (results) => {
      set({ resultsRaw: results ?? [] });
      recompute();
    },

    setLoading: (v) => set({ isLoading: v }),
    setError: (msg) => set({ error: msg }),

    setStops: (stops) => {
      set((s) => ({ filters: { ...s.filters, stops } }));
      recompute();
    },

    toggleAirline: (airlineCode) => {
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
      });
      recompute();
    },

    setPriceRange: (min, max) => {
      set((s) => ({ filters: { ...s.filters, priceMin: min, priceMax: max } }));
      recompute();
    },

    resetFilters: () => {
      set({ filters: defaultFilters });
      recompute();
    },

    setSortBy: (v) => {
      set({ sortBy: v });
      recompute();
    },
  };
});
