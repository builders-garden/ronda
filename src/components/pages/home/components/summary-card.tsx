import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils";

type SummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
  bgColor?: string;
};

export function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor = "text-gray-600",
  bgColor = "bg-[rgba(244,244,245,0.5)]",
}: SummaryCardProps) {
  return (
    <Card className="flex w-full flex-col items-center justify-between gap-0 rounded-[24px] border border-border bg-white p-3 shadow-none">
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl",
          bgColor
        )}
      >
        <Icon className={cn("size-5", iconColor)} strokeWidth={2} />
      </div>
      <p className="mt-4 text-center font-medium text-[11px] text-muted-foreground uppercase leading-tight tracking-[0.275px]">
        {label}
      </p>
      <p className="mt-1 font-bold text-[24px] text-muted tracking-[-0.6px]">
        {value}
      </p>
    </Card>
  );
}
