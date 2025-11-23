"use client";

import type { QueryObserverResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { InvitationCard } from "@/components/pages/home/components/invitation-card";
import { useGroupParticipants } from "@/hooks/use-group-participants";
import type { UserGroupsResponse } from "@/hooks/use-user-groups";
import type { groups } from "@/lib/database/db.schema";
import type { CirclesPageContent } from "@/lib/enum";
import {
  useGetGroupInfoDetailed,
  useGetPeriodDeposits,
  useJoinGroup,
} from "@/lib/smart-contracts/hooks";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

type Group = typeof groups.$inferSelect;

export type InvitationCardData = {
  name: string;
  memberCount: number;
  weeklyAmount: string;
  totalWeeks: number;
  dueDate?: string;
  avatars: string[];
  potAmount?: string;
  nextPayout?: string;
  currentWeek?: number;
  createdDate?: string;
  initialContent?: CirclesPageContent;
  refetchUserGroups?: () => Promise<
    QueryObserverResult<UserGroupsResponse, Error>
  >;
};

export function InvitationCardWithData({
  group,
  initialContent,
  refetchUserGroups,
}: {
  group: Group;
  initialContent?: CirclesPageContent;
  refetchUserGroups?: () => Promise<
    QueryObserverResult<UserGroupsResponse, Error>
  >;
}) {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const groupAddress = group.groupAddress as Address | undefined;

  // Join group hook
  const {
    joinGroup,
    isSuccess: joinSuccess,
    error: joinError,
  } = useJoinGroup(groupAddress);

  // Fetch participants for member count
  const { data: participantsData } = useGroupParticipants({
    groupId: group.id,
    enabled: !!group.id,
  });

  // Read onchain data
  const { data: groupInfo } = useGetGroupInfoDetailed(
    groupAddress,
    !!groupAddress
  );

  // Get current period deposits for pot amount
  const currentOperationIndex = useMemo(
    () => groupInfo?.currentOperationIndex,
    [groupInfo]
  );

  const { data: periodDeposits } = useGetPeriodDeposits(
    groupAddress,
    currentOperationIndex,
    !!groupAddress && currentOperationIndex !== undefined
  );

  // Memoize computed values to prevent unnecessary re-renders
  const cardData = useMemo(() => {
    if (!(groupInfo && groupAddress)) {
      return null;
    }

    if (!groupInfo.exists) {
      return null;
    }

    // Calculate weekly amount
    const recurringAmount = Number(
      formatUnits(groupInfo.recurringAmount ?? BigInt(0), USDC_DECIMALS)
    );
    const weeklyAmount = `$${recurringAmount.toFixed(0)}`;

    // Calculate total weeks and current week
    const totalWeeks = Number(groupInfo.operationCounter) || 1;
    const currentWeek = Math.min(
      Number(groupInfo.currentOperationIndex) + 1,
      totalWeeks
    );

    // Calculate pot amount
    let potAmount = "$0";
    if (periodDeposits) {
      const deposits = Number(
        formatUnits(periodDeposits as bigint, USDC_DECIMALS)
      );
      potAmount = `$${deposits.toFixed(0)}`;
    } else {
      const estimatedPot = recurringAmount * currentWeek;
      potAmount = `$${estimatedPot.toFixed(0)}`;
    }

    // Calculate next payout date based on deposit frequency
    const depositFrequencyDays =
      Number(groupInfo.depositFrequency) / (24 * 60 * 60);
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(
      nextPayoutDate.getDate() + Math.ceil(depositFrequencyDays)
    );
    const nextPayout = nextPayoutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Due date (same as next payout for invitations)
    const dueDate = nextPayout;

    // Created date from group
    const createdDate = group.createdAt
      ? new Date(group.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined;

    // Get member count from participants
    const memberCount = participantsData?.participants.length || 0;
    // For avatars, we'll use empty array for now
    const avatars: string[] = [];

    return {
      name: group.name,
      memberCount,
      weeklyAmount,
      totalWeeks,
      dueDate,
      avatars,
      potAmount,
      nextPayout,
      currentWeek,
      createdDate,
    };
  }, [
    groupInfo,
    groupAddress,
    group.name,
    group.createdAt,
    periodDeposits,
    participantsData,
  ]);

  const handleJoin = () => {
    if (!(groupAddress && address)) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      setIsJoining(true);
      joinGroup();
    } catch (error) {
      console.error("Error joining group:", error);
      setIsJoining(false);
      toast.error("Failed to join group");
    }
  };

  // Handle join success
  useEffect(() => {
    const handleJoinSuccess = async () => {
      if (joinSuccess) {
        await refetchUserGroups?.();
        setIsJoining(false);
        toast.success("Successfully joined the group!");
      }
    };
    handleJoinSuccess();
  }, [joinSuccess, refetchUserGroups]);

  // Handle join error
  useEffect(() => {
    if (joinError) {
      setIsJoining(false);
      toast.error("Failed to join group");
    }
  }, [joinError]);

  if (!cardData) {
    return null;
  }

  return (
    <InvitationCard
      avatars={cardData.avatars}
      contractAddress={groupAddress}
      createdDate={cardData.createdDate}
      currentWeek={cardData.currentWeek}
      dueDate={cardData.dueDate}
      groupId={group.id}
      initialContent={initialContent}
      isJoining={isJoining}
      memberCount={cardData.memberCount}
      name={cardData.name}
      nextPayout={cardData.nextPayout}
      onAccept={handleJoin}
      potAmount={cardData.potAmount}
      totalWeeks={cardData.totalWeeks}
      weeklyAmount={cardData.weeklyAmount}
    />
  );
}
