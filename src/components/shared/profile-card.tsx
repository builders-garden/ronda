import { MessageCircleWarning } from "lucide-react";
import { cn } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";

type ProfileCardProps = {
  name: string;
  status: "pending" | "accepted" | "declined";
  statusMessage: string;
  avatar: string;
};

export const ProfileCard = ({
  name,
  status,
  statusMessage,
  avatar,
}: ProfileCardProps) => (
  <Card className="flex w-full flex-col items-center justify-center gap-4 border border-border p-3 shadow-sm">
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center justify-center gap-2">
        <Avatar className="size-10 border-[1.5px] border-foreground">
          <AvatarImage alt="" src={avatar} />
          <AvatarFallback className="bg-gray-200 text-xs">JL</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-start justify-center gap-0.5">
          <span className="font-medium text-muted text-sm">{name}</span>
          <span
            className={cn(
              "text-xs",
              status === "pending"
                ? "text-warning"
                : status === "accepted"
                  ? "text-success"
                  : "text-error"
            )}
          >
            {statusMessage}
          </span>
        </div>
      </div>

      <MessageCircleWarning className="size-6 text-warning" />
    </div>
  </Card>
);
