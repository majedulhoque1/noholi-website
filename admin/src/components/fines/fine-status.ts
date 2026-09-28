import type { BadgeVariant } from "@/components/StatusBadge";
import type { FineStatus } from "@/hooks/use-fines";

export const FINE_STATUS_VARIANT: Record<FineStatus, BadgeVariant> = {
  Unpaid: "destructive",
  "Partially Paid": "warning",
  Paid: "success",
  Waived: "muted",
  Voided: "muted",
  Accruing: "accent",
};
