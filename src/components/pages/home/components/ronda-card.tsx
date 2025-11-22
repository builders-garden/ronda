import { type LucideIcon, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils";

type RondaStatus = "deposit-due" | "active" | "completed";

type RondaCardProps = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  currentWeek: number;
  totalWeeks: number;
  status: RondaStatus;
  avatars: string[];
  statusMessage?: string;
  statusIcon?: LucideIcon;
  onDeposit?: () => void;
};

const statusConfig: Record<
  RondaStatus,
  {
    badge: string;
    badgeColor: string;
    iconColor: string;
    progressColor: string;
  }
> = {
  "deposit-due": {
    badge: "Deposit Due",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    iconColor: "text-green-600",
    progressColor: "bg-blue-500",
  },
  active: {
    badge: "Active",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-blue-600",
    progressColor: "bg-blue-500",
  },
  completed: {
    badge: "Completed",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-purple-600",
    progressColor: "bg-green-500",
  },
};

export function RondaCard({
  name,
  memberCount,
  weeklyAmount,
  currentWeek,
  totalWeeks,
  status,
  avatars,
  statusMessage,
  statusIcon: StatusIcon,
  onDeposit,
}: RondaCardProps) {
  const config = statusConfig[status];
  const progress = (currentWeek / totalWeeks) * 100;

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn("rounded-full bg-gray-100 p-2", config.iconColor)}
            >
              <Users className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base text-black">{name}</span>
              <span className="text-gray-600 text-xs">
                {memberCount} members • {weeklyAmount}/week
              </span>
            </div>
          </div>
          <Badge className={cn("text-xs", config.badgeColor)} variant="outline">
            {config.badge}
          </Badge>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-gray-600 text-xs">
            <span>
              {currentWeek} of {totalWeeks} weeks
            </span>
          </div>
          <Progress
            className={cn("h-2", config.progressColor)}
            value={progress}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="-space-x-2 flex">
            {avatars.slice(0, 4).map((avatar, index) => (
              <Avatar
                className="size-7 border-2 border-white"
                key={`${name}-${index}-${avatar}`}
              >
                <AvatarImage alt="" src={avatar} />
                <AvatarFallback className="bg-gray-200 text-xs">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {memberCount > 4 && (
            <span className="text-gray-600 text-xs">+{memberCount - 4}</span>
          )}
        </div>

        {statusMessage && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg p-3",
              status === "deposit-due"
                ? "bg-yellow-50"
                : status === "active"
                  ? "bg-purple-50"
                  : "bg-green-50"
            )}
          >
            {StatusIcon && (
              <StatusIcon
                className={cn(
                  "size-4",
                  status === "deposit-due"
                    ? "text-yellow-600"
                    : status === "active"
                      ? "text-purple-600"
                      : "text-green-600"
                )}
              />
            )}
            <span
              className={cn(
                "text-xs",
                status === "deposit-due"
                  ? "text-yellow-800"
                  : status === "active"
                    ? "text-purple-800"
                    : "text-green-800"
              )}
            >
              {statusMessage}
            </span>
          </div>
        )}

        {status === "deposit-due" && onDeposit && (
          <Button
            className="mt-4 w-full bg-orange-500 text-white hover:bg-orange-600"
            onClick={onDeposit}
          >
            Deposit Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
