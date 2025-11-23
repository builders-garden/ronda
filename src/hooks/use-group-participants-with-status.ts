import { useMemo } from "react";
import type { Address } from "viem";
import type { Participants } from "@/lib/database/db.schema";
import {
  useGetGroupInfoDetailed,
  useGetUserDepositStatusForAllPeriods,
  useHasUserDepositedCurrentPeriod,
  useIsInvited,
  useIsMember,
} from "@/lib/smart-contracts/hooks";
import { useGroupParticipants } from "./use-group-participants";

export type ParticipantStatus =
  | "invited" // Invited but not joined yet
  | "member" // Joined the group
  | "deposited" // Deposited this week
  | "pending" // Member but hasn't deposited this week
  | "received_payout" // Already received a payout
  | "unknown"; // Status cannot be determined

export type ParticipantWithStatus = Participants & {
  // On-chain status
  isInvited: boolean;
  isMember: boolean;
  hasDepositedCurrentPeriod: boolean;
  depositHistory?: boolean[]; // Deposit status for all periods
  totalPeriods?: bigint;

  // Computed status
  status: ParticipantStatus;
  statusMessage: string;
};

export type UseGroupParticipantsWithStatusOptions = {
  groupId: string;
  contractAddress?: Address;
  enabled?: boolean;
};

export const useGroupParticipantsWithStatus = (
  options: UseGroupParticipantsWithStatusOptions
) => {
  const { groupId, contractAddress, enabled = true } = options;

  // Fetch participants from backend
  const {
    data: participantsData,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useGroupParticipants({
    groupId,
    enabled: enabled && !!groupId,
  });

  // Fetch group info for context
  const { data: groupInfo } = useGetGroupInfoDetailed(
    contractAddress,
    enabled && !!contractAddress
  );

  const participants = participantsData?.participants ?? [];

  // We'll check each participant's on-chain status
  // Note: This is a simplified version - in production you might want to batch these calls
  const participantsWithStatus: ParticipantWithStatus[] = useMemo(() => {
    if (!participants.length) {
      return [];
    }

    return participants.map((participant) => {
      // Default values
      const enriched: ParticipantWithStatus = {
        ...participant,
        isInvited: false,
        isMember: false,
        hasDepositedCurrentPeriod: false,
        status: "unknown",
        statusMessage: "Status unknown",
      };

      // Compute status based on backend data
      if (participant.paid) {
        enriched.status = "received_payout";
        enriched.statusMessage = "Received payout";
      } else if (participant.contributed) {
        enriched.status = "deposited";
        enriched.statusMessage = "Deposited this week";
      } else if (participant.accepted) {
        enriched.status = "member";
        enriched.statusMessage = "Active member";
      } else {
        enriched.status = "invited";
        enriched.statusMessage = "Invitation pending";
      }

      return enriched;
    });
  }, [participants]);

  return {
    participants: participantsWithStatus,
    isLoading: isLoadingParticipants,
    error: participantsError,
    groupInfo,
  };
};

// Hook to get a single participant's on-chain status
export const useParticipantOnChainStatus = (
  contractAddress: Address | undefined,
  userAddress: Address | undefined,
  enabled = true
) => {
  const { data: isInvited, isLoading: isLoadingInvited } = useIsInvited(
    contractAddress,
    userAddress,
    enabled && !!contractAddress && !!userAddress
  );

  const { data: isMember, isLoading: isLoadingMember } = useIsMember(
    contractAddress,
    userAddress,
    enabled && !!contractAddress && !!userAddress
  );

  const { data: hasDepositedCurrentPeriod, isLoading: isLoadingDeposit } =
    useHasUserDepositedCurrentPeriod(
      contractAddress,
      userAddress,
      enabled && !!contractAddress && !!userAddress
    );

  const { data: depositStatus, isLoading: isLoadingDepositHistory } =
    useGetUserDepositStatusForAllPeriods(
      contractAddress,
      userAddress,
      enabled && !!contractAddress && !!userAddress
    );

  const status = useMemo(() => {
    if (isMember === false && isInvited === true) {
      return "invited";
    }
    if (isMember === true) {
      if (hasDepositedCurrentPeriod === true) {
        return "deposited";
      }
      return "pending";
    }
    return "unknown";
  }, [isMember, isInvited, hasDepositedCurrentPeriod]);

  const statusMessage = useMemo(() => {
    switch (status) {
      case "invited":
        return "Invitation pending";
      case "deposited":
        return "Deposited this week";
      case "pending":
        return "Deposit pending";
      default:
        return "Status unknown";
    }
  }, [status]);

  return {
    isInvited: isInvited ?? false,
    isMember: isMember ?? false,
    hasDepositedCurrentPeriod: hasDepositedCurrentPeriod ?? false,
    depositHistory: depositStatus?.depositedPeriods,
    totalPeriods: depositStatus?.totalPeriods,
    status: status as ParticipantStatus,
    statusMessage,
    isLoading:
      isLoadingInvited ||
      isLoadingMember ||
      isLoadingDeposit ||
      isLoadingDepositHistory,
  };
};
