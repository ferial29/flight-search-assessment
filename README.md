# ✈️ Flight Search Engine – Frontend React Engineer Assessment

A modern flight search engine built with **Next.js (App Router)** and **TypeScript**, focusing on clean UI, real-time filtering, and resilient data handling using the **Amadeus Self-Service API (Sandbox)**.

This project was created as part of a frontend engineering assessment to demonstrate architecture, UX decisions, and state management.

---

##  Features

- Flight search using **IATA airport codes** (e.g. MCT, DXB, IST)
- Supports **one-way** and **round-trip** searches
- Passenger count and cabin class selection
- Real-time filtering:
  - Stops (non-stop, 1 stop, 2+ stops)
  - Airlines
  - Price range
- Sorting options:
  - Cheapest
  - Fastest
  - Best (balanced)
- **Live price trend chart** that updates instantly with filters
- Fully **responsive design** (desktop & mobile)
- Graceful handling of external API failures

---

##  Architecture Overview

- **Next.js App Router** for routing and server-side API handling
- **API Route (`/api/flights`)** to securely communicate with Amadeus
- **Zustand** for global state management (results, filters, sorting)
- **React Hook Form + Zod** for form handling and validation
- **Recharts** for price trend visualization
- **Tailwind CSS** for styling and layout

---

##  API & Environment Variables

The application integrates with the **Amadeus Self-Service API (Test/Sandbox environment)**.

For security reasons, API credentials are **not committed** to this repository.  
They must be provided via environment variables:

```env
# Amadeus Self-Service API (Test Environment)
AMADEUS_CLIENT_ID=YOUR_AMADEUS_CLIENT_ID
AMADEUS_CLIENT_SECRET=YOUR_AMADEUS_CLIENT_SECRET
AMADEUS_ENV=test
---------

▶️ Demo

Live Demo: https://your-vercel-link.vercel.app

Loom Walkthrough (3–4 min): https://loom.com/share/your-video-id