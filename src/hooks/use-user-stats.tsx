"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useUserGroups } from "@/hooks/use-user-groups";
import {
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

  // Track the last stats to avoid duplicate calls
  const lastStatsRef = useRef<string>("");

  useEffect(() => {
    // Wait for all data to be available before processing
    if (
      groupInfo === undefined ||
      depositStatus === undefined ||
      isMember === undefined
    ) {
      return;
    }

    if (!isMember) {
      const stats = {
        totalDeposits: 0,
        isActive: false,
        payoutsReceived: 0,
        totalPeriods: 0,
        depositedPeriods: 0,
      };
      const statsKey = JSON.stringify(stats);

      if (lastStatsRef.current !== statsKey) {
        lastStatsRef.current = statsKey;
        onStatsReady(groupId, stats);
      }
      return;
    }

    const recurringAmount = Number(
      formatUnits(groupInfo.recurringAmount ?? 0, USDC_DECIMALS)
    );

    const totalPeriods = depositStatus ? Number(depositStatus.totalPeriods) : 0;
    const depositedPeriods = depositStatus
      ? (depositStatus.depositedPeriods?.filter(Boolean).length ?? 0)
      : 0;
    const totalDeposits = recurringAmount * depositedPeriods;

    // A group is considered active if it exists and the user is a member
    const isActive = groupInfo.exists && Boolean(isMember);

    // Calculate payouts received - this would need contract data to determine
    // For now, we'll use a placeholder that can be enhanced later
    const payoutsReceived = 0;

    const stats = {
      totalDeposits,
      isActive,
      payoutsReceived,
      totalPeriods,
      depositedPeriods,
    };

    // Only call onStatsReady if the stats have actually changed
    const statsKey = JSON.stringify(stats);
    if (lastStatsRef.current !== statsKey) {
      lastStatsRef.current = statsKey;
      onStatsReady(groupId, stats);
    }
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

  // Memoize the callback to prevent unnecessary re-renders of child components
  const handleStatsReady = useCallback(
    (groupId: string, _stats: GroupStats) => {
      setGroupStatsMap((prev) => {
        // Only update if the stats have actually changed
        const existingStats = prev.get(groupId);
        if (
          existingStats &&
          JSON.stringify(existingStats) === JSON.stringify(_stats)
        ) {
          return prev;
        }

        const next = new Map(prev);
        next.set(groupId, _stats);
        return next;
      });
    },
    []
  );

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
