import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface RowActionsProps {
  /** Up to 2-3 visible primary actions */
  primary?: ActionItem[];
  /** Secondary actions shown inside ⋮ dropdown */
  secondary?: ActionItem[];
}

export function RowActions({ primary = [], secondary = [] }: RowActionsProps) {
  if (primary.length === 0 && secondary.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 justify-end" onClick={(e) => e.stopPropagation()}>
      <TooltipProvider delayDuration={300}>
        {primary.map((action) => {
          const Icon = action.icon;
          return (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded transition-colors disabled:opacity-40 md:h-auto md:w-auto md:p-1",
                    action.variant === "destructive"
                      ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[12px] px-2 py-1">
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {secondary.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-11 w-11 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors md:h-auto md:w-auto md:p-1">
              <MoreVertical className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {secondary.map((action, i) => {
              const Icon = action.icon;
              const isDestructive = action.variant === "destructive";
              return (
                <span key={action.label}>
                  {isDestructive && i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      "gap-2 text-[13px] cursor-pointer min-h-[44px] md:min-h-0",
                      isDestructive && "text-destructive focus:text-destructive"
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {action.label}
                  </DropdownMenuItem>
                </span>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
