import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/lib/store";

/** Shown while the member row is loading, or with the real reason and a retry when it could not load. */
export function MemberLoadState({ loadingLabel }: { loadingLabel?: string }) {
  const { t } = useApp();
  const { memberError, refreshMember } = useAuth();
  if (!memberError) {
    return (
      <div className="py-24 text-center text-sm text-muted-foreground" role="status">
        {loadingLabel ?? t("auth.loadingAccount")}
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md py-24 text-center" role="alert">
      <p className="font-medium">{t("auth.memberLoadFailed")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{memberError}</p>
      <Button className="mt-6" variant="outline" onClick={() => void refreshMember()}>
        {t("auth.retry")}
      </Button>
    </div>
  );
}

/** Coloured dot + localized status of the member ("Active Patron", "Suspended", "Expired"). */
export function MemberStatus({ status }: { status: string }) {
  const { t } = useApp();
  const label =
    status === "Active" || status === "Suspended" || status === "Expired"
      ? t(`auth.status.${status}`)
      : status;
  return <span className={status === "Active" ? "text-success" : "text-warning"}>● {label}</span>;
}
