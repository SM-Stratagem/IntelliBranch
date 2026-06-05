import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import StoreHydrator from "@/components/StoreHydrator";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "IntelliBranch — Branch Intelligence Platform",
  description:
    "IntelliBranch connects to your existing systems and transforms operational data into live P&L, AI-powered alerts, branch benchmarking, and forward-looking forecasts.",
  keywords: "branch intelligence, multi-location analytics, retail analytics, F&B analytics, franchise dashboard, operational data platform",
  openGraph: {
    title: "IntelliBranch — Branch Intelligence Platform",
    description: "Live P&L, AI alerts, and cross-branch benchmarking for multi-location businesses.",
    url: "https://intellibranch.io",
    siteName: "IntelliBranch",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="font-instrument text-[#1E293B] bg-white antialiased">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
