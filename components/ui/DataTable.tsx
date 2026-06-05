"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  /** Cell renderer. */
  render: (row: T) => ReactNode;
  /** Value used for sorting/searching (defaults to non-sortable). */
  sortValue?: (row: T) => number | string;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
};

/**
 * Generic, dependency-free data table: client-side sort (click headers),
 * optional fuzzy search, and pagination. Typed via a generic so callers keep
 * full type-safety on their row shape.
 */
export default function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder,
  searchFields,
  pageSize = 10,
  onRowClick,
  initialSort,
  dense = false,
  emptyMessage = "No records found.",
}: {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (row: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  initialSort?: { key: string; dir: "asc" | "desc" };
  dense?: boolean;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim() || !searchFields) return data;
    const q = query.toLowerCase();
    return data.filter((row) => searchFields(row).toLowerCase().includes(q));
  }, [data, query, searchFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(clampedPage * pageSize, clampedPage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortValue) return;
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
    setPage(0);
  };

  return (
    <div>
      {searchFields && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder ?? "Search…"}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm text-[#1E293B] outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
      )}

      <div className="scroll-thin overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className={`whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] ${
                      c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                    } ${c.sortValue ? "cursor-pointer select-none hover:text-[#475569]" : ""} ${c.headerClassName ?? ""}`}
                  >
                    <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "flex-row-reverse" : ""}`}>
                      {c.header}
                      {active && (sort!.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-[#94A3B8]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[#F1F5F9] transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-[#F8F9FC]" : ""
                  }`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 ${dense ? "py-2" : "py-3"} ${
                        c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"
                      } ${c.className ?? ""}`}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Showing {clampedPage * pageSize + 1}–{Math.min((clampedPage + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="rounded-md border border-[#E2E8F0] p-1.5 disabled:opacity-40 enabled:hover:border-primary enabled:hover:text-primary"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-medium">
              {clampedPage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="rounded-md border border-[#E2E8F0] p-1.5 disabled:opacity-40 enabled:hover:border-primary enabled:hover:text-primary"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
