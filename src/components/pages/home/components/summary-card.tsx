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
    <Card className="flex h-[175px] w-full flex-col items-center justify-start rounded-[24px] border border-[rgba(232,235,237,0.5)] bg-white p-0 shadow-none">
      <div
        className={cn(
          "mt-5 flex size-11 items-center justify-center rounded-2xl",
          bgColor
        )}
      >
        <Icon className={cn("size-5", iconColor)} strokeWidth={2} />
      </div>
      <p className="mt-4 font-medium text-[#6f7780] text-[11px] uppercase tracking-[0.275px]">
        {label}
      </p>
      <p className="mt-1 font-bold text-[24px] text-zinc-950 tracking-[-0.6px]">
        {value}
      </p>
    </Card>
  );
}
