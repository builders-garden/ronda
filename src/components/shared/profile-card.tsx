import {
  AlertCircle,
  CheckCircle2,
  Lock,
  MessageCircleWarning,
  XCircle,
} from "lucide-react";
import { cn } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

type ProfileCardProps = {
  name: string;
  status: "pending" | "accepted" | "declined" | "due" | "skipped" | "paid";
  statusMessage: string;
  avatar: string;
  showReceivedBadge?: boolean;
};

const statusConfig = {
  pending: {
    textColor: "text-[#f59e42]",
    icon: MessageCircleWarning,
    iconBg: "bg-[rgba(245,158,66,0.1)]",
    iconColor: "text-[#f59e42]",
  },
  accepted: {
    textColor: "text-[#6b9b7a]",
    icon: CheckCircle2,
    iconBg: "bg-[rgba(107,155,122,0.1)]",
    iconColor: "text-[#6b9b7a]",
  },
  declined: {
    textColor: "text-red-500",
    icon: XCircle,
    iconBg: "bg-[rgba(239,68,68,0.1)]",
    iconColor: "text-red-500",
  },
  due: {
    textColor: "text-[#f59e42]",
    icon: Lock,
    iconBg: "bg-[rgba(245,158,66,0.1)]",
    iconColor: "text-[#f59e42]",
  },
  skipped: {
    textColor: "text-red-500",
    icon: AlertCircle,
    iconBg: "bg-[rgba(239,68,68,0.1)]",
    iconColor: "text-red-500",
  },
  paid: {
    textColor: "text-[#6b9b7a]",
    icon: CheckCircle2,
    iconBg: "bg-[rgba(107,155,122,0.1)]",
    iconColor: "text-[#6b9b7a]",
  },
};

export const ProfileCard = ({
  name,
  status,
  statusMessage,
  avatar,
  showReceivedBadge = false,
}: ProfileCardProps) => {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Card className="flex w-full flex-col items-center justify-center gap-0 rounded-2xl border border-[rgba(232,235,237,0.5)] bg-white p-4 shadow-none">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 rounded-full border-2 border-[rgba(232,235,237,0.3)] shadow-[0px_0px_0px_2px_rgba(232,235,237,0.3)]">
            <AvatarImage alt="" src={avatar} />
            <AvatarFallback className="bg-zinc-100 text-xs">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start justify-center gap-1">
            <span className="font-semibold text-[14px] text-zinc-950 tracking-[-0.35px]">
              {name}
            </span>
            <div className="flex items-center gap-2">
              {showReceivedBadge && (
                <Badge
                  className="rounded-full border-none bg-[rgba(107,155,122,0.1)] px-2 py-0.5 font-semibold text-[#6b9b7a] text-[10px] uppercase tracking-[0.25px]"
                  variant="outline"
                >
                  Received
                </Badge>
              )}
              <span className={cn("font-medium text-[12px]", config.textColor)}>
                {statusMessage}
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            config.iconBg
          )}
        >
          <IconComponent
            className={cn("size-5", config.iconColor)}
            strokeWidth={2}
          />
        </div>
      </div>
    </Card>
  );
};
