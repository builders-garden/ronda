import type { LucideIcon } from "lucide-react";

type ActivityMessageProps = {
  title: string;
  message: string;
  timestamp: string;
  IconComponent: LucideIcon;
};

export const ActivityMessage = ({
  title,
  message,
  timestamp,
  IconComponent,
}: ActivityMessageProps) => (
  <div className="flex w-full items-start justify-between gap-2">
    <div className="flex items-center justify-center gap-3">
      <IconComponent className="size-6 text-muted" />
      <div className="flex flex-col items-start justify-center">
        <span className="font-medium text-muted text-sm">{title}</span>
        <span className="text-muted-foreground text-xs">{message}</span>
      </div>
    </div>
    <span className="text-muted-foreground text-xs">{timestamp}</span>
  </div>
);
