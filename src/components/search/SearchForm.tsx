"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI primitives
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/utils";

// Form schema & types
import { searchSchema, type SearchFormValues } from "./schema";

type Props = {
  // Called when the user submits a valid search form
  onSubmit: (values: SearchFormValues) => void;
};

export function SearchForm({ onSubmit }: Props) {
  // Initialize React Hook Form with Zod validation
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tripType: "roundTrip",
      origin: "",
      destination: "",
      departDate: "",
      returnDate: "",
      adults: 1,
      cabin: "ECONOMY",
    },
    mode: "onSubmit",
  });

  // Watch trip type to toggle return date logic
  const tripType = form.watch("tripType");

  // Extract form validation errors
  const errors = form.formState.errors;

  // Today’s date in YYYY-MM-DD format (used for date min values)
  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  return (
    <form
      // Handle validated form submission
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      {/* Header + Trip type toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-100">Search</p>
          <p className="text-xs text-zinc-400">
            Use IATA codes for now (MCT, DXB, IST…)
          </p>
        </div>

        <Segmented
          value={tripType}
          // Update trip type and revalidate dependent fields
          onChange={(v) =>
            form.setValue("tripType", v, { shouldValidate: true })
          }
          options={[
            { value: "roundTrip", label: "Round-trip" },
            { value: "oneWay", label: "One-way" },
          ]}
        />
      </div>

      {/* Main form grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Origin */}
        <div className="space-y-1.5">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            placeholder="MCT"
            autoCapitalize="characters"
            // Normalize input to uppercase IATA format
            {...form.register("origin", {
              setValueAs: (v) => String(v).toUpperCase().trim(),
            })}
          />
          {errors.origin?.message && (
            <p className="text-xs text-red-400">{errors.origin.message}</p>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            placeholder="DXB"
            autoCapitalize="characters"
            {...form.register("destination", {
              setValueAs: (v) => String(v).toUpperCase().trim(),
            })}
          />
          {errors.destination?.message && (
            <p className="text-xs text-red-400">
              {errors.destination.message}
            </p>
          )}
        </div>

        {/* Departure date */}
        <div className="space-y-1.5">
          <Label htmlFor="departDate">Departure</Label>
          <Input
            id="departDate"
            type="date"
            min={today}
            {...form.register("departDate")}
          />
          {errors.departDate?.message && (
            <p className="text-xs text-red-400">
              {errors.departDate.message}
            </p>
          )}
        </div>

        {/* Return date (disabled for one-way trips) */}
        <div
          className={cn("space-y-1.5", tripType === "oneWay" && "opacity-50")}
        >
          <Label htmlFor="returnDate">Return</Label>
          <Input
            id="returnDate"
            type="date"
            min={form.getValues("departDate") || today}
            disabled={tripType === "oneWay"}
            {...form.register("returnDate")}
          />
          {tripType === "roundTrip" && errors.returnDate?.message && (
            <p className="text-xs text-red-400">
              {errors.returnDate.message}
            </p>
          )}
        </div>

        {/* Passenger count */}
        <div className="space-y-1.5">
          <Label htmlFor="adults">Passengers (Adults)</Label>
          <Input
            id="adults"
            type="number"
            min={1}
            max={9}
            {...form.register("adults")}
          />
          {errors.adults?.message && (
            <p className="text-xs text-red-400">{errors.adults.message}</p>
          )}
        </div>

        {/* Cabin class */}
        <div className="space-y-1.5">
          <Label htmlFor="cabin">Cabin</Label>
          <select
            id="cabin"
            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/40"
            {...form.register("cabin")}
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          // Reset all fields to their default values
          onClick={() => form.reset()}
          className="h-10 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          Reset
        </button>

        <button
          type="submit"
          className="h-10 rounded-xl bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          Search
        </button>
      </div>
    </form>
  );
}
