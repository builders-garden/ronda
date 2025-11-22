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
  bgColor = "bg-gray-100",
}: SummaryCardProps) {
  return (
    <Card className="flex items-center justify-center rounded-md bg-white p-3 drop-shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <div className={cn("rounded-full p-2", iconColor, bgColor)}>
          <Icon className="size-4.5" />
        </div>
      </div>
      <div className="flex w-full items-center justify-start">
        <span className="font-semibold text-lg text-muted">{value}</span>
      </div>
    </Card>
  );
}
