import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";

type SummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor?: string;
};

export function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor = "text-gray-600",
}: SummaryCardProps) {
  return (
    <Card className="flex-1 border-gray-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("rounded-full bg-gray-100 p-2", iconColor)}>
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-gray-600 text-xs">{label}</span>
          <span className="font-semibold text-black text-lg">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}
