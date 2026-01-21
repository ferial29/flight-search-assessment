import type { FlightResult } from "@/store/searchStore";

// Simple, deterministic-ish random helper
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const AIRLINES = [
  { code: "WY", name: "Oman Air" },
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "SV", name: "Saudia" },
];

function minsToDuration(mins: number) {
  return mins;
}

function timeStr(h: number, m: number) {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function generateMockFlights(count = 35): FlightResult[] {
  const basePrice = rand(90, 220);

  return Array.from({ length: count }).map((_, i) => {
    const a = AIRLINES[rand(0, AIRLINES.length - 1)];
    const stopsRaw = rand(0, 2); // 0,1,2
    const stops: 0 | 1 | 2 = stopsRaw === 2 ? 2 : (stopsRaw as 0 | 1);

    const departH = rand(5, 22);
    const departM = [0, 15, 30, 45][rand(0, 3)];
    const durationMins = minsToDuration(rand(55, 520) + stops * rand(40, 120));

    const arriveTotalM = departH * 60 + departM + durationMins;
    const arriveH = Math.floor((arriveTotalM / 60) % 24);
    const arriveM = arriveTotalM % 60;

    const price = basePrice + rand(-20, 180) + stops * rand(15, 60);

    return {
      id: `MOCK-${i}-${a.code}-${price}`,
      airline: a.name,
      airlineCode: a.code,
      stops,
      price: Math.max(60, price),
      currency: "USD",
      departTime: timeStr(departH, departM),
      arriveTime: timeStr(arriveH, arriveM),
      durationMins,
    };
  });
}
