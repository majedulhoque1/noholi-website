import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Lock, Cloud, RotateCcw } from "lucide-react";

/**
 * Honest backup panel. Backups run outside the app; there is nothing to click here.
 * (Showing the live status of the last backup run is a later task.)
 */
export function BackupSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Backups
          </CardTitle>
          <CardDescription className="text-xs">Backups run automatically. Nothing needs to be done from this screen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-[13px] text-foreground">
          <p>
            Backups run nightly (GitHub Action → encrypted → Cloudflare R2).
          </p>
          <ul className="space-y-2">
            <li className="flex gap-2"><Database className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" /><span>Every night a full copy of the database is taken.</span></li>
            <li className="flex gap-2"><Lock className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" /><span>The copy is encrypted before it leaves the server, so member details are never stored in the clear.</span></li>
            <li className="flex gap-2"><Cloud className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" /><span>It is stored in Cloudflare R2 and kept for 30 days. A failed run emails the administrator.</span></li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Restoring</CardTitle>
          <CardDescription className="text-xs">Restores are done by the technical team, not from this app.</CardDescription>
        </CardHeader>
        <CardContent className="text-[13px] text-foreground">
          Restore steps: see <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">ops/restore.md</code>.
        </CardContent>
      </Card>
    </div>
  );
}
