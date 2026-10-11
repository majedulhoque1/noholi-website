import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Small "Soon" tag for features that have no backend yet (same look as the account menu's tag). */
export function SoonTag({ className }: { className?: string }) {
  const { t } = useApp();
  return (
    <span
      className={cn(
        "rounded-sm border border-border px-1 py-px text-[0.625rem] font-medium uppercase leading-none tracking-wide text-muted-foreground",
        className,
      )}
    >
      {t("auth.soon")}
    </span>
  );
}
