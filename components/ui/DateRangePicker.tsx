"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { useDashboard, PRESET_LABEL, type DateRangePreset } from "@/lib/store";

const PRESETS: DateRangePreset[] = ["today", "7d", "30d", "90d"];

/** Preset + custom date range control wired to global dateRange state. */
export default function DateRangePicker({ compact = false }: { compact?: boolean }) {
  const range = useDashboard((s) => s.dateRange);
  const setRange = useDashboard((s) => s.setDateRange);
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] transition-colors hover:border-primary ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        <Calendar size={15} className="text-primary" />
        <span className="font-medium">{PRESET_LABEL[range]}</span>
        <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setRange(p);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F8F9FC] ${
                range === p ? "font-semibold text-primary" : "text-[#1E293B]"
              }`}
            >
              {PRESET_LABEL[p]}
              {range === p && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
          <div className="mt-2 border-t border-[#EEF1F6] pt-2">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Custom range</p>
            <div className="flex items-center gap-1.5 px-3">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] px-2 py-1 text-xs outline-none focus:border-primary"
              />
              <span className="text-xs text-[#94A3B8]">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => {
                setRange("custom");
                setOpen(false);
              }}
              disabled={!customFrom || !customTo}
              className="mt-2 w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-primary-lt"
            >
              Apply custom range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
