import { cn } from "@/lib/utils";

/**
 * How a column appears in the mobile card layout (below md, ~<768px).
 * - title: the card's headline (usually one column; more than one stacks).
 * - subtitle: a muted line right under the title.
 * - meta: a small "Label: value" line in a 2-column grid (the default).
 * - badge: pinned to the top-right of the card (stacks if more than one).
 * - actions: rendered at the bottom of the card, right-aligned, below a divider.
 * - hidden: not rendered on mobile at all.
 */
export type MobileRole = "title" | "subtitle" | "meta" | "badge" | "actions" | "hidden";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render: (row: T, index: number) => React.ReactNode;
  /** Role this column plays in the mobile card layout. Default: "meta". */
  mobile?: MobileRole;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data found.",
  className,
  compact = false,
}: DataTableProps<T>) {
  const cellPad = compact ? "px-3 py-1.5" : "px-4 py-2";
  const headerPad = compact ? "px-3 py-1.5" : "px-4 py-2";

  return (
    <div className={cn("md:bg-card md:border md:border-border md:rounded", className)}>
      {/* Desktop / tablet table (unchanged) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left font-medium text-muted-foreground",
                    headerPad,
                    col.headerClassName
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={keyExtractor(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn(cellPad, col.className)}>
                    {col.render(row, i)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-muted-foreground text-[13px]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-2">
        {data.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, i) => (
            <MobileCard key={keyExtractor(row, i)} row={row} index={i} columns={columns} onRowClick={onRowClick} />
          ))
        )}
      </div>
    </div>
  );
}

function MobileCard<T>({
  row,
  index,
  columns,
  onRowClick,
}: {
  row: T;
  index: number;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}) {
  const visible = columns.filter((c) => c.mobile !== "hidden");
  const title = visible.filter((c) => c.mobile === "title");
  const subtitle = visible.filter((c) => c.mobile === "subtitle");
  const badge = visible.filter((c) => c.mobile === "badge");
  const actions = visible.filter((c) => c.mobile === "actions");
  const meta = visible.filter((c) => !c.mobile || c.mobile === "meta");
  const hasHeader = title.length > 0 || subtitle.length > 0 || badge.length > 0;

  return (
    <div
      role={onRowClick ? "button" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      onKeyDown={
        onRowClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick(row);
              }
            }
          : undefined
      }
      className={cn(
        "rounded-lg border border-border bg-card p-3",
        onRowClick && "cursor-pointer active:bg-secondary/40 transition-colors"
      )}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            {title.map((c) => (
              <div key={c.key} className="text-[14px] font-medium leading-snug text-foreground break-words">
                {c.render(row, index)}
              </div>
            ))}
            {subtitle.map((c) => (
              <div key={c.key} className="text-[12px] leading-snug text-muted-foreground break-words">
                {c.render(row, index)}
              </div>
            ))}
          </div>
          {badge.length > 0 && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              {badge.map((c) => (
                <div key={c.key}>{c.render(row, index)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {meta.length > 0 && (
        <div className={cn("grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]", hasHeader && "mt-2")}>
          {meta.map((c) => (
            <div key={c.key} className="min-w-0 break-words">
              {c.label ? <span className="text-muted-foreground">{c.label}: </span> : null}
              <span className="text-foreground">{c.render(row, index)}</span>
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div
          className="mt-2 flex items-center justify-end gap-1 border-t border-border pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((c) => (
            <div key={c.key}>{c.render(row, index)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
