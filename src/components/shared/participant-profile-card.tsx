import type { Address } from "viem";
import type { ParticipantWithStatus } from "@/hooks/use-group-participants-with-status";
import { useUserByAddress } from "@/hooks/use-user-by-address";
import { ProfileCard } from "./profile-card";

type ParticipantProfileCardProps = {
  participant: ParticipantWithStatus;
  currentUserAddress?: Address;
};

// Map participant status to ProfileCard status
const mapStatus = (
  participantStatus: ParticipantWithStatus["status"]
): "pending" | "accepted" | "declined" | "due" | "skipped" | "paid" => {
  switch (participantStatus) {
    case "invited":
      return "pending";
    case "deposited":
      return "accepted";
    case "member":
      return "accepted";
    case "pending":
      return "due";
    case "received_payout":
      return "paid";
    default:
      return "pending";
  }
};

export const ParticipantProfileCard = ({
  participant,
  currentUserAddress,
}: ParticipantProfileCardProps) => {
  const { data: userData, isLoading } = useUserByAddress({
    address: participant.userAddress as Address,
    enabled: true,
  });

  // Determine display name
  const isCurrentUser =
    currentUserAddress?.toLowerCase() === participant.userAddress.toLowerCase();

  const displayName = isCurrentUser
    ? "You"
    : userData?.neynarUser?.display_name ||
      userData?.neynarUser?.username ||
      `${participant.userAddress.slice(0, 6)}...${participant.userAddress.slice(-4)}`;

  // Get avatar
  const avatar =
    userData?.neynarUser?.pfp_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userAddress}`;

  // Show loading state
  if (isLoading) {
    return (
      <ProfileCard
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=loading"
        name="Loading..."
        status="pending"
        statusMessage="Loading participant info"
      />
    );
  }

  // Map status and statusMessage
  const status = mapStatus(participant.status);
  const showReceivedBadge = participant.status === "received_payout";

  return (
    <ProfileCard
      avatar={avatar}
      name={displayName}
      showReceivedBadge={showReceivedBadge}
      status={status}
      statusMessage={participant.statusMessage}
    />
  );
};
