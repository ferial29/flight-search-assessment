import { NextResponse } from "next/server";
import { amadeusFetch } from "@/lib/amadeus/client";
import type { AmadeusFlightOffersResponse } from "@/lib/amadeus/types";
import { normalizeAmadeusOffers } from "@/lib/amadeus/normalize";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const originLocationCode = url.searchParams.get("origin") ?? "";
    const destinationLocationCode = url.searchParams.get("destination") ?? "";
    const departureDate = url.searchParams.get("departDate") ?? "";
    const returnDate = url.searchParams.get("returnDate") ?? ""; // optional
    const adults = url.searchParams.get("adults") ?? "1";
    const travelClass = url.searchParams.get("cabin") ?? "ECONOMY";

    // Basic validation
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { error: "Missing required params: origin, destination, departDate" },
        { status: 400 }
      );
    }

    const params: Record<string, string> = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      travelClass,
      currencyCode: "USD",
      max: "50",
    };

    // Add returnDate only if provided (round-trip)
    if (returnDate) params.returnDate = returnDate;

    const raw = await amadeusFetch<AmadeusFlightOffersResponse>(
      "/v2/shopping/flight-offers",
      params
    );

    const normalized = normalizeAmadeusOffers(raw);

    return NextResponse.json({
      results: normalized,
      meta: {
        count: normalized.length,
        // expose only what is safe/useful for debugging
        source: "amadeus-test",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
