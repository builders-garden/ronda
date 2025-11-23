"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useUserGroups } from "@/hooks/use-user-groups";
import {
  type GroupInfoDetailed,
  type UserDepositStatus,
  useGetGroupInfoDetailed,
  useGetUserDepositStatusForAllPeriods,
  useIsMember,
} from "@/lib/smart-contracts/hooks";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

export type GroupStats = {
  totalDeposits: number;
  isActive: boolean;
  payoutsReceived: number;
  totalPeriods: number;
  depositedPeriods: number;
};

export function GroupStatsReader({
  groupId,
  groupAddress,
  userAddress,
  onStatsReady,
}: {
  groupId: string;
  groupAddress: Address;
  userAddress: Address;
  onStatsReady: (groupId: string, stats: GroupStats) => void;
}) {
  const { data: groupInfo } = useGetGroupInfoDetailed(groupAddress, true);
  const { data: depositStatus } = useGetUserDepositStatusForAllPeriods(
    groupAddress,
    userAddress,
    true
  );
  const { data: isMember } = useIsMember(groupAddress, userAddress, true);

  useEffect(() => {
    if (!(groupInfo && isMember)) {
      onStatsReady(groupId, {
        totalDeposits: 0,
        isActive: false,
        payoutsReceived: 0,
        totalPeriods: 0,
        depositedPeriods: 0,
      });
      return;
    }

    // Type assertion - wagmi returns tuple data that needs to be cast
    const info = groupInfo as unknown as GroupInfoDetailed;
    const recurringAmount = Number(
      formatUnits(info.recurringAmount, USDC_DECIMALS)
    );

    const status = depositStatus as unknown as UserDepositStatus | undefined;
    const totalPeriods = status ? Number(status.totalPeriods) : 0;
    const depositedPeriods = status
      ? status.depositedPeriods.filter(Boolean).length
      : 0;
    const totalDeposits = recurringAmount * depositedPeriods;

    // A group is considered active if it exists and the user is a member
    const isActive = info.exists && Boolean(isMember);

    // Calculate payouts received - this would need contract data to determine
    // For now, we'll use a placeholder that can be enhanced later
    const payoutsReceived = 0;

    onStatsReady(groupId, {
      totalDeposits,
      isActive,
      payoutsReceived,
      totalPeriods,
      depositedPeriods,
    });
  }, [groupId, groupInfo, depositStatus, isMember, onStatsReady]);

  return null;
}

export type UserStats = {
  totalSaved: number;
  activeCircles: number;
  reliability: number; // Percentage based on deposit completion rate
  isLoading: boolean;
};

export function useUserStats(): UserStats & { readers: ReactElement } {
  const { address } = useAccount();
  const { data: userGroupsData, isLoading } = useUserGroups({
    address: address || "",
    enabled: !!address,
  });

  const [groupStatsMap, setGroupStatsMap] = useState<Map<string, GroupStats>>(
    new Map()
  );

  const handleStatsReady = (groupId: string, _stats: GroupStats) => {
    setGroupStatsMap((prev) => {
      const next = new Map(prev);
      next.set(groupId, stats);
      return next;
    });
  };

  const stats = useMemo(() => {
    if (!(userGroupsData?.groups && address) || isLoading) {
      return {
        totalSaved: 0,
        activeCircles: 0,
        reliability: 0,
      };
    }

    const groups = userGroupsData.groups;
    let totalSaved = 0;
    let activeCircles = 0;
    let totalPeriods = 0;
    let depositedPeriods = 0;

    // Aggregate stats from all groups
    for (const group of groups) {
      if (group.groupAddress) {
        const groupStats = groupStatsMap.get(group.id);
        if (groupStats) {
          totalSaved += groupStats.totalDeposits;
          if (groupStats.isActive) {
            activeCircles += 1;
          }
          totalPeriods += groupStats.totalPeriods;
          depositedPeriods += groupStats.depositedPeriods;
        }
      }
    }

    // Calculate reliability as percentage of completed deposits
    const reliability =
      totalPeriods > 0
        ? Math.round((depositedPeriods / totalPeriods) * 100)
        : 100;

    return {
      totalSaved,
      activeCircles,
      reliability,
    };
  }, [userGroupsData?.groups, address, groupStatsMap, isLoading]);

  const groups = userGroupsData?.groups || [];

  const readers = (
    <>
      {groups.map((group) => {
        if (!(group.groupAddress && address)) {
          return null;
        }
        return (
          <GroupStatsReader
            groupAddress={group.groupAddress as Address}
            groupId={group.id}
            key={group.id}
            onStatsReady={handleStatsReady}
            userAddress={address}
          />
        );
      })}
    </>
  );

  return {
    totalSaved: stats.totalSaved,
    activeCircles: stats.activeCircles,
    reliability: stats.reliability,
    isLoading,
    readers,
  };
}
