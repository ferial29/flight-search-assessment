"use client";

import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/search/SearchForm";
import { FiltersPanel } from "@/components/results/FiltersPanel";
import { ResultsSummaryBar } from "@/components/results/ResultsSummaryBar";
import { ResultsList } from "@/components/results/ResultsList";
import { PriceChart } from "@/components/charts/PriceChart";
import { useSearchStore } from "@/store/searchStore";
import type { SearchFormValues } from "@/components/search/schema";

function toQuery(values: SearchFormValues) {
  const params = new URLSearchParams();
  params.set("origin", values.origin);
  params.set("destination", values.destination);
  params.set("departDate", values.departDate);
  params.set("adults", String(values.adults));
  params.set("cabin", values.cabin);

  // If you later add return-leg support in API, you can pass it like:
  // if (values.tripType === "roundTrip" && values.returnDate) params.set("returnDate", values.returnDate);

  return params.toString();
}

export function SearchExperience() {
  const error = useSearchStore((s) => s.error);
  const isLoading = useSearchStore((s) => s.isLoading);

  const setSearchParams = useSearchStore((s) => s.setSearchParams);
  const setResultsRaw = useSearchStore((s) => s.setResultsRaw);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);

  const handleSearch = async (values: SearchFormValues) => {
    try {
      setError(null);
      setLoading(true);
      setSearchParams(values);

      const res = await fetch(`/api/flights?${toQuery(values)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "Search failed. Please try again.";
        throw new Error(msg);
      }

      const results = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setResultsRaw(results);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setResultsRaw([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <div className="pt-8">
        <h1 className="text-2xl font-bold text-zinc-900">Flight Search</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Search flights, apply filters, and see the price chart update instantly.
        </p>
      </div>

      {/* Search */}
      <div className="mt-6">
        {/* ✅ Card بدون title/subtitle چون SearchForm خودش هدر داره */}
        <Card className="p-5">
          <SearchForm onSubmit={handleSearch} />
        </Card>
      </div>

      {/* Main */}
      <div className="mt-6 grid grid-cols-12 gap-4">
        {/* Filters */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-4">
            <Card className="p-5">
              <FiltersPanel />
            </Card>
          </div>
        </div>

        {/* Results + Chart */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <ResultsSummaryBar />

          {/* اگر خواستی لودینگ رو نمایش بدی می‌تونیم اسکلتون هم اضافه کنیم */}
          <ResultsList />

          <PriceChart />
        </div>
      </div>
    </div>
  );
}
