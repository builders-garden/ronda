import { CircleUserIcon, ShieldCheck } from "lucide-react";
import Image from "next/image";

type ProfileHeaderProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string | null;
};

export function ProfileHeader({
  avatarUrl,
  displayName,
  username,
}: ProfileHeaderProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      {/* Avatar */}
      <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-border/30">
        {avatarUrl ? (
          <Image
            alt={displayName}
            className="h-full w-full object-cover"
            fill
            sizes="96px"
            src={avatarUrl}
          />
        ) : (
          <CircleUserIcon className="mx-auto my-auto size-12 text-muted-foreground" />
        )}
      </div>

      {/* Name */}
      <h2 className="font-bold text-2xl text-muted tracking-tight">
        {displayName}
      </h2>

      {/* Username */}
      {username && <p className="text-muted-foreground text-sm">@{username}</p>}

      {/* Reliability Badge */}
      <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-5 py-2.5">
        <ShieldCheck className="size-5 text-success" />
        <span className="font-semibold text-sm text-success tracking-tight">
          98% Reliability
        </span>
      </div>
    </div>
  );
}
