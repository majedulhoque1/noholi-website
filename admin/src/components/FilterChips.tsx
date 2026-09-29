import { cn } from "@/lib/utils";

interface FilterChipsProps<T extends string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterChips<T extends string>({ options, value, onChange, className }: FilterChipsProps<T>) {
  return (
    <div className={cn("flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory", className)}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "shrink-0 snap-start min-h-[36px] px-3 py-1.5 rounded text-[12px] font-medium transition-colors capitalize",
            value === opt
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
