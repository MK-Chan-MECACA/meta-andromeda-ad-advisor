import type { Entitlements } from "@/lib/entitlements";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BillingButton } from "./BillingButton";

/** Plan badge + analyses used this period; billing actions for admins only. */
export function UsageMeter({
  entitlements: e,
  billing,
}: {
  entitlements: Entitlements;
  /** Omitted for members. */
  billing?: { canUpgrade: boolean; canManage: boolean };
}) {
  const pct = Math.min(100, Math.round((e.used / e.quota) * 100));
  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className="capitalize">
        {e.plan}
      </Badge>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden w-32 flex-col gap-1 sm:flex" tabIndex={0}>
            <Progress
              value={pct}
              className={e.allowed ? undefined : "[&>*]:bg-warn!"}
              aria-label="Analyses used this period"
            />
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {e.used}/{e.quota} analyses
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {e.used} of {e.quota} analyses used this period
        </TooltipContent>
      </Tooltip>
      {e.reason === "seats" ? (
        <span className="text-xs text-warn">
          Over the {e.seats}-seat limit — remove members or upgrade.
        </span>
      ) : null}
      {billing ? <BillingButton {...billing} /> : null}
    </div>
  );
}
