"use client";

import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/search/SearchForm";
import type { SearchFormValues } from "@/components/search/schema";
import { FiltersPanel } from "@/components/results/FiltersPanel";
import { ResultsList } from "@/components/results/ResultsList";
import { ResultsSummaryBar } from "@/components/results/ResultsSummaryBar";
import { PriceChart } from "@/components/charts/PriceChart";
import { useSearchStore } from "@/store/searchStore";

export function SearchExperience() {
  const setSearchParams = useSearchStore((s) => s.setSearchParams);
  const setResultsRaw = useSearchStore((s) => s.setResultsRaw);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);

  const handleSearch = async (values: SearchFormValues) => {
    setError(null);
    setLoading(true);
    setSearchParams(values);

    try {
      const qs = new URLSearchParams({
        origin: values.origin,
        destination: values.destination,
        departDate: values.departDate,
        adults: String(values.adults),
        cabin: values.cabin,
      });

      if (values.tripType === "roundTrip" && values.returnDate) {
        qs.set("returnDate", values.returnDate);
      }

      const res = await fetch(`/api/flights?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const json = (await res.json()) as { results: any[] };
      setResultsRaw(json.results);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Flight Search Engine</h1>
        <p className="text-sm text-zinc-300">
          Search flights, apply filters, and see live price trends.
        </p>
      </header>

      <Card>
        <SearchForm onSubmit={handleSearch} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Sticky + internally scrollable filters for better UX */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card title="Filters">
            <div className="max-h-[calc(100vh-120px)] overflow-auto pr-1">
              <FiltersPanel />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Results">
            <div className="space-y-3">
              <ResultsSummaryBar />
              <ResultsList />
            </div>
          </Card>

          <Card title="Price Trend">
            <PriceChart />
          </Card>
        </div>
      </div>
    </main>
  );
}
