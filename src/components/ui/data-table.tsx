"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as TTable,
  type HeaderGroup,
  type Row,
  type Cell,
  type Header,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TableProviderProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  style?: React.CSSProperties;
  children: React.ReactNode;
}

interface TableHeaderProps<TData> {
  children: (props: { headerGroup: HeaderGroup<TData> }) => React.ReactNode;
}

interface TableHeaderGroupProps<TData> {
  headerGroup: HeaderGroup<TData>;
  children: (props: { header: Header<TData, unknown> }) => React.ReactNode;
}

interface TableHeadProps<TData> {
  header: Header<TData, unknown>;
  style?: React.CSSProperties;
}

interface TableBodyProps<TData> {
  children: (props: { row: Row<TData> }) => React.ReactNode;
}

interface TableRowProps<TData> {
  row: Row<TData>;
  children: (props: { cell: Cell<TData, unknown> }) => React.ReactNode;
  style?: React.CSSProperties;
}

interface TableCellProps<TData> {
  cell: Cell<TData, unknown>;
  style?: React.CSSProperties;
}

interface TableColumnHeaderProps<TData> {
  column: import("@tanstack/react-table").Column<TData, unknown>;
  title: string;
  style?: React.CSSProperties;
}

// ── Context ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableContext = React.createContext<TTable<any> | null>(null);

function useTable<TData>() {
  const ctx = React.useContext(TableContext);
  if (!ctx) throw new Error("Must be used within TableProvider");
  return ctx as TTable<TData>;
}

// ── Provider ──────────────────────────────────────────────────────────────────
function TableProvider<TData>({ columns, data, style, children }: TableProviderProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <TableContext.Provider value={table}>
      <div style={{ width: "100%", overflowX: "auto", ...style }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function TableHeader<TData>({ children }: TableHeaderProps<TData>) {
  const table = useTable<TData>();
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => children({ headerGroup }))}
    </thead>
  );
}

function TableHeaderGroup<TData>({ headerGroup, children }: TableHeaderGroupProps<TData>) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {headerGroup.headers.map((header) => children({ header }))}
    </tr>
  );
}

function TableHead<TData>({ header, style }: TableHeadProps<TData>) {
  return (
    <th
      style={{
        padding: "12px 16px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.35)",
        background: "rgba(255,255,255,0.02)",
        width: header.getSize(),
        ...style,
      }}
    >
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  );
}

// ── Body ──────────────────────────────────────────────────────────────────────
function TableBody<TData>({ children }: TableBodyProps<TData>) {
  const table = useTable<TData>();
  return (
    <tbody>
      {table.getRowModel().rows.map((row) => children({ row }))}
    </tbody>
  );
}

function TableRow<TData>({ row, children, style }: TableRowProps<TData>) {
  return (
    <tr
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        transition: "background 150ms",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {row.getVisibleCells().map((cell) => children({ cell }))}
    </tr>
  );
}

function TableCell<TData>({ cell, style }: TableCellProps<TData>) {
  return (
    <td style={{ padding: "12px 16px", fontSize: "13px", color: "rgba(255,255,255,0.7)", ...style }}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}

// ── Column Header (sortable) ──────────────────────────────────────────────────
function TableColumnHeader<TData>({ column, title, style }: TableColumnHeaderProps<TData>) {
  const iconStyle: React.CSSProperties = { width: "14px", height: "14px", color: "#a78bfa", flexShrink: 0 };
  const fadedIconStyle: React.CSSProperties = { width: "14px", height: "14px", opacity: 0.4, flexShrink: 0 };

  if (!column.getCanSort()) {
    return (
      <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", ...style }}>
        {title}
      </span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "rgba(255,255,255,0.35)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit",
        transition: "color 150ms",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
    >
      {title}
      {sorted === "asc" ? (
        <ChevronUp style={iconStyle} />
      ) : sorted === "desc" ? (
        <ChevronDown style={iconStyle} />
      ) : (
        <ChevronsUpDown style={fadedIconStyle} />
      )}
    </button>
  );
}

export {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
};
