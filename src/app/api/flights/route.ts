import { NextResponse } from "next/server";
import { amadeusFetch } from "@/lib/amadeus/client";
import type { AmadeusFlightOffersResponse } from "@/lib/amadeus/types";
import { normalizeAmadeusOffers } from "@/lib/amadeus/normalize";

export const runtime = "nodejs";

// -----------------------------
// Helpers
// -----------------------------
function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isAmadeusSystemError141(msg: string) {
  return msg.includes('"code":141') || msg.includes("SYSTEM ERROR");
}

// Very small mock dataset for demo stability (only used when sandbox is down)
function mockResults(origin: string, destination: string) {
  const now = new Date();
  const hh = (n: number) => String(n).padStart(2, "0");

  // Make times look realistic
  const t1 = `${hh((now.getHours() + 1) % 24)}:${hh(15)}`;
  const t2 = `${hh((now.getHours() + 3) % 24)}:${hh(40)}`;
  const t3 = `${hh((now.getHours() + 5) % 24)}:${hh(5)}`;
  const t4 = `${hh((now.getHours() + 8) % 24)}:${hh(10)}`;

  return [
    {
      id: "mock-1",
      airline: "Mock Air",
      airlineCode: "MK",
      stops: 0,
      price: 118,
      currency: "USD",
      departTime: t1,
      arriveTime: t2,
      durationMins: 145,
      origin,
      destination,
    },
    {
      id: "mock-2",
      airline: "Demo Airways",
      airlineCode: "DA",
      stops: 1,
      price: 99,
      currency: "USD",
      departTime: t1,
      arriveTime: t4,
      durationMins: 240,
      origin,
      destination,
    },
    {
      id: "mock-3",
      airline: "Sample Lines",
      airlineCode: "SL",
      stops: 2,
      price: 87,
      currency: "USD",
      departTime: t3,
      arriveTime: t4,
      durationMins: 185,
      origin,
      destination,
    },
  ];
}

// Retry wrapper (only retries Amadeus system error 141)
async function amadeusFetchWithRetry<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const delays = [0, 600, 1200]; // 3 tries total
  let lastErr: any;

  for (const d of delays) {
    if (d) await sleep(d);
    try {
      return await amadeusFetch<T>(path, params);
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? "");
      if (!isAmadeusSystemError141(msg)) {
        // Not a transient sandbox system error -> fail fast
        throw e;
      }
    }
  }

  throw lastErr;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const originLocationCode = (url.searchParams.get("origin") ?? "").toUpperCase();
    const destinationLocationCode = (url.searchParams.get("destination") ?? "").toUpperCase();
    const departureDate = url.searchParams.get("departDate") ?? "";
    const returnDate = url.searchParams.get("returnDate"); // optional
    const adultsRaw = url.searchParams.get("adults") ?? "1";
    const travelClass = url.searchParams.get("cabin") ?? "ECONOMY";

    // -----------------------------
    // Validation
    // -----------------------------
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { error: "Missing required params: origin, destination, departDate" },
        { status: 400 }
      );
    }

    if (originLocationCode.length !== 3 || destinationLocationCode.length !== 3) {
      return NextResponse.json(
        { error: "Origin and destination must be valid 3-letter IATA codes" },
        { status: 400 }
      );
    }

    if (!isValidDate(departureDate)) {
      return NextResponse.json(
        { error: "Invalid departure date format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    if (returnDate && !isValidDate(returnDate)) {
      return NextResponse.json(
        { error: "Invalid return date format (YYYY-MM-DD required)" },
        { status: 400 }
      );
    }

    const adults = Number(adultsRaw);
    if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
      return NextResponse.json(
        { error: "Adults must be a number between 1 and 9" },
        { status: 400 }
      );
    }

    const allowedCabins = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];
    if (!allowedCabins.includes(travelClass)) {
      return NextResponse.json({ error: "Invalid cabin class" }, { status: 400 });
    }

    if (returnDate) {
      const d1 = new Date(departureDate);
      const d2 = new Date(returnDate);
      if (d2 < d1) {
        return NextResponse.json(
          { error: "Return date must be after departure date" },
          { status: 400 }
        );
      }
    }

    const params: Record<string, string> = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: String(adults),
      travelClass,
      currencyCode: "USD",
      max: "50",
    };

    if (returnDate) params.returnDate = returnDate;

    // -----------------------------
    // Amadeus call (with retry)
    // -----------------------------
    const raw = await amadeusFetchWithRetry<AmadeusFlightOffersResponse>(
      "/v2/shopping/flight-offers",
      params
    );

    const normalized = normalizeAmadeusOffers(raw);

    return NextResponse.json({
      results: normalized,
      meta: {
        count: normalized.length,
        source: "amadeus-test",
        retried: true,
      },
    });
  } catch (e: any) {
    const message = String(e?.message ?? "Unknown server error");

    // If sandbox keeps failing with system error 141, fall back to mock results
    if (isAmadeusSystemError141(message)) {
      const url = new URL(req.url);
      const origin = (url.searchParams.get("origin") ?? "").toUpperCase();
      const destination = (url.searchParams.get("destination") ?? "").toUpperCase();

      const mocked = mockResults(origin || "XXX", destination || "YYY");

      return NextResponse.json(
        {
          results: mocked,
          meta: {
            count: mocked.length,
            source: "mock",
            note: "Amadeus sandbox returned a temporary system error (141). Served mock data to keep demo usable.",
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
