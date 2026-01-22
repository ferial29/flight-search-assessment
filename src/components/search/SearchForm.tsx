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
  onSubmit: (values: SearchFormValues) => void;
};

export function SearchForm({ onSubmit }: Props) {
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

  const tripType = form.watch("tripType");
  const errors = form.formState.errors;

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">Search</p>
          <p className="text-xs text-zinc-500">
            Use IATA codes for now (MCT, DXB, IST…)
          </p>
        </div>

        <Segmented
          value={tripType}
          onChange={(v) =>
            form.setValue("tripType", v, { shouldValidate: true })
          }
          options={[
            { value: "roundTrip", label: "Round-trip" },
            { value: "oneWay", label: "One-way" },
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="origin">Origin</Label>
          <Input
            id="origin"
            placeholder="MCT"
            autoCapitalize="characters"
            {...form.register("origin", {
              setValueAs: (v) => String(v).toUpperCase().trim(),
            })}
          />
          {errors.origin?.message && (
            <p className="text-xs text-red-600">{errors.origin.message}</p>
          )}
        </div>

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
            <p className="text-xs text-red-600">
              {errors.destination.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departDate">Departure</Label>
          <Input
            id="departDate"
            type="date"
            min={today}
            {...form.register("departDate")}
          />
          {errors.departDate?.message && (
            <p className="text-xs text-red-600">{errors.departDate.message}</p>
          )}
        </div>

        <div className={cn("space-y-1.5", tripType === "oneWay" && "opacity-50")}>
          <Label htmlFor="returnDate">Return</Label>
          <Input
            id="returnDate"
            type="date"
            min={form.getValues("departDate") || today}
            disabled={tripType === "oneWay"}
            {...form.register("returnDate")}
          />
          {tripType === "roundTrip" && errors.returnDate?.message && (
            <p className="text-xs text-red-600">{errors.returnDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adults">Passengers (Adults)</Label>
          <Input
            id="adults"
            type="number"
            min={1}
            max={9}
            // ✅ This ensures RHF provides a number (not a string), matching schema adults: z.number()
            {...form.register("adults", { valueAsNumber: true })}
          />
          {errors.adults?.message && (
            <p className="text-xs text-red-600">{errors.adults.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cabin">Cabin</Label>
          <select
            id="cabin"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            {...form.register("cabin")}
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => form.reset()}
          className="h-10 rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 hover:bg-zinc-50"
        >
          Reset
        </button>

<button
  type="submit"
  className="
    h-10 rounded-xl
    bg-zinc-200 text-zinc-900
    px-4 text-sm font-medium
    transition-all duration-200 ease-out
    hover:bg-zinc-300 hover:shadow-md hover:-translate-y-[1px]
    active:bg-zinc-400 active:translate-y-0 active:shadow-sm
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60
  "
>
  Search
</button>


      </div>
    </form>
  );
}
