import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type InvitationCardProps = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  avatars: string[];
  onAccept?: () => void;
  onDecline?: () => void;
};

export function InvitationCard({
  name,
  memberCount,
  weeklyAmount,
  avatars,
  onAccept,
  onDecline,
}: InvitationCardProps) {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="-space-x-2 flex">
            {avatars.slice(0, 3).map((avatar, index) => (
              <Avatar
                className="size-8 border-2 border-white"
                key={`${name}-${index}-${avatar}`}
              >
                <AvatarImage alt="" src={avatar} />
                <AvatarFallback className="bg-gray-200 text-xs">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-black text-sm">{name}</span>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
              <span>+{memberCount - 3}</span>
              <span>•</span>
              <span>{weeklyAmount}/week</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="h-8 bg-green-500 px-4 text-white text-xs hover:bg-green-600"
            onClick={onAccept}
            size="sm"
          >
            Accept
          </Button>
          <Button
            className="h-8 border-gray-300 bg-white px-4 text-black text-xs hover:bg-gray-50"
            onClick={onDecline}
            size="sm"
            variant="outline"
          >
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
