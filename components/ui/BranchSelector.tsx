"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Search, Store } from "lucide-react";
import { useDashboard } from "@/lib/store";
import { useTenant } from "@/components/TenantProvider";

/** Searchable branch dropdown. Reads/writes the global selectedBranch state. */
export default function BranchSelector({ compact = false }: { compact?: boolean }) {
  const { visibleBranches, terms } = useTenant();
  const selected = useDashboard((s) => s.selectedBranch);
  const setSelected = useDashboard((s) => s.setSelectedBranch);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current =
    selected === "all"
      ? `All ${terms.branches}`
      : visibleBranches.find((b) => b.id === selected)?.name ?? `All ${terms.branches}`;

  const filtered = visibleBranches.filter((b) =>
    `${b.name} ${b.city}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-[#1E293B] transition-colors hover:border-primary ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
      >
        <Building2 size={15} className="text-primary" />
        <span className="max-w-[160px] truncate font-medium">{current}</span>
        <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${terms.branches.toLowerCase()}…`}
              className="w-full rounded-lg border border-[#E2E8F0] py-1.5 pl-8 pr-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="scroll-thin max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                setSelected("all");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#F8F9FC]"
            >
              <span className="flex items-center gap-2 font-medium text-[#1E293B]">
                <Building2 size={15} className="text-[#94A3B8]" /> All {terms.branches}
              </span>
              {selected === "all" && <Check size={15} className="text-primary" />}
            </button>
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelected(b.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#F8F9FC]"
              >
                <span className="flex items-center gap-2">
                  <Store size={15} className="text-[#94A3B8]" />
                  <span>
                    <span className="block font-medium text-[#1E293B]">{b.name}</span>
                    <span className="block text-xs text-[#94A3B8]">{b.city}</span>
                  </span>
                </span>
                {selected === b.id && <Check size={15} className="text-primary" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2.5 py-4 text-center text-xs text-[#94A3B8]">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
