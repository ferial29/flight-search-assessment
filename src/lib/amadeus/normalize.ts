import type { FlightResult } from "@/store/searchStore";
import type { AmadeusFlightOffersResponse } from "./types";

function isoDurationToMinutes(iso: string): number {
  // Supports patterns like PT2H35M / PT55M / PT3H
  const h = /(\d+)H/.exec(iso)?.[1];
  const m = /(\d+)M/.exec(iso)?.[1];
  return (h ? Number(h) * 60 : 0) + (m ? Number(m) : 0);
}

function toHHMM(isoDateTime: string): string {
  // isoDateTime like "2026-01-20T08:15:00"
  const d = new Date(isoDateTime);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function normalizeAmadeusOffers(
  payload: AmadeusFlightOffersResponse
): FlightResult[] {
  const carriers = payload.dictionaries?.carriers ?? {};

  return payload.data.map((offer) => {
    const firstItin = offer.itineraries?.[0];
    const segments = firstItin?.segments ?? [];

    const stops = Math.max(0, segments.length - 1);
    const airlineCode = segments[0]?.carrierCode ?? "NA";
    const airline = carriers[airlineCode] ?? airlineCode;

    const departAt = segments[0]?.departure?.at ?? new Date().toISOString();
    const arriveAt =
      segments[segments.length - 1]?.arrival?.at ?? new Date().toISOString();

    const durationMins = firstItin?.duration
      ? isoDurationToMinutes(firstItin.duration)
      : 0;

    return {
      id: offer.id,
      airline,
      airlineCode,
      stops: stops >= 2 ? 2 : stops, // keep 2 as "2+"
      price: Math.round(Number(offer.price.total)),
      currency: offer.price.currency,
      departTime: toHHMM(departAt),
      arriveTime: toHHMM(arriveAt),
      durationMins,
    };
  });
}
