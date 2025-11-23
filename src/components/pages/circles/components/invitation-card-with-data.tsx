"use client";

import { useMemo } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { InvitationCard } from "@/components/pages/home/components/invitation-card";
import { useGroupParticipants } from "@/hooks/use-group-participants";
import type { groups } from "@/lib/database/db.schema";
import {
  useGetGroupInfoDetailed,
  useGetPeriodDeposits,
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
};

export function InvitationCardWithData({ group }: { group: Group }) {
  const groupAddress = group.groupAddress as Address | undefined;

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

  if (!cardData) {
    return null;
  }

  return (
    <InvitationCard
      avatars={cardData.avatars}
      createdDate={cardData.createdDate}
      currentWeek={cardData.currentWeek}
      dueDate={cardData.dueDate}
      memberCount={cardData.memberCount}
      name={cardData.name}
      nextPayout={cardData.nextPayout}
      potAmount={cardData.potAmount}
      totalWeeks={cardData.totalWeeks}
      weeklyAmount={cardData.weeklyAmount}
    />
  );
}
