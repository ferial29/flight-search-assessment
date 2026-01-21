import { z } from "zod";

export const tripTypeSchema = z.enum(["roundTrip", "oneWay"]);

export const searchSchema = z
  .object({
    tripType: tripTypeSchema,
    origin: z
      .string()
      .trim()
      .min(3, "Origin is required (use IATA like MCT)")
      .max(3, "Use 3-letter IATA code"),
    destination: z
      .string()
      .trim()
      .min(3, "Destination is required (use IATA like DXB)")
      .max(3, "Use 3-letter IATA code"),
    departDate: z.string().min(1, "Departure date is required"),
    returnDate: z.string().optional(),
    adults: z.coerce.number().int().min(1).max(9),
    cabin: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  })
  .superRefine((val, ctx) => {
    if (val.tripType === "roundTrip") {
      if (!val.returnDate || val.returnDate.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Return date is required for round-trip",
          path: ["returnDate"],
        });
      }
      // اگر هر دو تاریخ بود، ترتیبش منطقی باشد
      if (val.returnDate && val.departDate) {
        const d1 = new Date(val.departDate);
        const d2 = new Date(val.returnDate);
        if (!Number.isNaN(d1.getTime()) && !Number.isNaN(d2.getTime())) {
          if (d2 < d1) {
            ctx.addIssue({
              code: "custom",
              message: "Return date must be after departure date",
              path: ["returnDate"],
            });
          }
        }
      }
    }
  });

export type SearchFormValues = z.infer<typeof searchSchema>;
