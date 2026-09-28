import type { BadgeVariant } from "@/components/StatusBadge";
import type { LoanStatus } from "@/hooks/use-loans";

export const LOAN_STATUS_VARIANT: Record<LoanStatus, BadgeVariant> = {
  Active: "success",
  Overdue: "destructive",
  Returned: "muted",
  Cancelled: "muted",
  Lost: "warning",
};
