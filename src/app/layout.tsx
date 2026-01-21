import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Search",
  description: "Responsive flight search with live price trends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-950 text-zinc-50 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
