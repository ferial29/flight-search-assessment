// Minimal subset of Amadeus Flight Offers Search response we care about.
// We keep this lightweight to avoid over-typing the whole API.

export type AmadeusFlightOffersResponse = {
    data: Array<{
      id: string;
      price: {
        total: string;
        currency: string;
      };
      itineraries: Array<{
        duration: string; // ISO 8601 duration e.g. "PT2H35M"
        segments: Array<{
          departure: { at: string }; // ISO datetime
          arrival: { at: string }; // ISO datetime
          carrierCode: string; // e.g. "EK"
        }>;
      }>;
    }>;
    dictionaries?: {
      carriers?: Record<string, string>; // carrierCode -> airline name
    };
  };
  