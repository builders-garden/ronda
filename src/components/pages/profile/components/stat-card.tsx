import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
  bgColor?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  iconColor = "text-muted",
  bgColor = "bg-muted/5",
}: StatCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-5 rounded-3xl border-border/50 bg-white p-5 drop-shadow-xs">
      {/* Icon */}
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl",
          bgColor
        )}
      >
        <Icon className={cn("size-5", iconColor)} strokeWidth={2} />
      </div>

      {/* Label */}
      <p className="text-center font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>

      {/* Value */}
      <p className="font-bold text-2xl text-muted tracking-tight">{value}</p>
    </Card>
  );
}
