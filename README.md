# Flight Search Engine (Frontend Assessment)

A responsive flight search experience inspired by the utility of Google Flights (not a visual clone).
It includes real-time filtering, sorting, and a live price trend chart that updates instantly as users refine results.

## Demo
- Live: <YOUR_DEPLOYED_URL>
- Loom walkthrough (3–4 mins): https://www.loom.com/share/5d017656c3a24bd3adf8c5d73a3bbc5f

## Features
- **Flight Search + Results** using Amadeus Self-Service API (Test environment)
- **Complex Filtering (simultaneous)**:
  - Stops (non-stop / 1 stop / 2+ stops)
  - Airline selection
  - Price range (min/max)
- **Sorting**: Cheapest / Fastest / Best (weighted)
- **Live Price Trend Chart** (Recharts) that updates in real time with filters & sorting
- **Responsive UI** (mobile + desktop)
- **UX polish**:
  - Sticky filter panel on desktop
  - Clear summary bar (results count, cheapest, fastest)
  - Empty states and basic error handling

## Tech Stack
- **Next.js (App Router)** + TypeScript
- **Zustand** for client state (results + filters + sorting)
- **Recharts** for the live price chart
- **Tailwind CSS** for styling

## Architecture Notes
### Why a server-side API route?
Amadeus requires a client credential token. The app calls Amadeus through a Next.js route:
- Keeps credentials **off the client**
- Avoids CORS issues
- Allows token caching on the server

Flow:
1) UI submits search params  
2) `GET /api/flights` (Next.js route) requests an Amadeus access token  
3) Calls Amadeus Flight Offers API  
4) Normalizes the response into a stable `FlightResult` shape  
5) UI renders results and derives chart + filters instantly from the dataset

### Real-time filtering + chart sync
Filtering/sorting is applied client-side on the in-memory dataset:
- Flight list updates instantly
- Summary stats recompute instantly
- Chart data is derived from the same filtered dataset

This avoids re-fetching on each filter interaction and improves responsiveness.

## Setup

### 1) Install dependencies
```bash
npm install
