"use client";

import { Banknote, CircleDollarSign, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useUserGroups } from "@/hooks/use-user-groups";
import {
  useGetGroupInfoDetailed,
  useGetUserDepositStatusForAllPeriods,
  useIsMember,
} from "@/lib/smart-contracts/hooks";
import { StatCard } from "./stat-card";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

type GroupStats = {
  totalDeposits: number;
  isActive: boolean;
  payoutsReceived: number;
};

function GroupStatsReader({
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
      });
      return;
    }

    const recurringAmount = Number(
      formatUnits(groupInfo.recurringAmount ?? 0, USDC_DECIMALS)
    );

    const depositedPeriods = depositStatus
      ? (depositStatus.depositedPeriods?.filter(Boolean).length ?? 0)
      : 0;
    const totalDeposits = recurringAmount * depositedPeriods;

    // A group is considered active if it exists and the user is a member
    const isActive = groupInfo.exists && Boolean(isMember);

    // Calculate payouts received - this would need contract data to determine
    // For now, we'll use a placeholder that can be enhanced later
    const payoutsReceived = 0;

    onStatsReady(groupId, {
      totalDeposits,
      isActive,
      payoutsReceived,
    });
  }, [groupId, groupInfo, depositStatus, isMember, onStatsReady]);

  return null;
}

export function ProfileStats() {
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
      next.set(groupId, _stats);
      return next;
    });
  };

  const stats = useMemo(() => {
    if (!(userGroupsData?.groups && address)) {
      return {
        circlesJoined: 0,
        totalSaved: 0,
        payoutsReceived: 0,
        activeCircles: 0,
      };
    }

    const groups = userGroupsData.groups;
    let totalSaved = 0;
    let activeCircles = 0;
    let totalPayouts = 0;

    // Aggregate stats from all groups
    for (const group of groups) {
      if (group.groupAddress) {
        const _stats = groupStatsMap.get(group.id);
        if (_stats) {
          totalSaved += _stats.totalDeposits;
          if (_stats.isActive) {
            activeCircles += 1;
          }
          totalPayouts += _stats?.payoutsReceived;
        }
      }
    }

    return {
      circlesJoined: groups.length,
      totalSaved,
      payoutsReceived: totalPayouts,
      activeCircles,
    };
  }, [userGroupsData?.groups, address, groupStatsMap]);

  // Format currency value
  const formatCurrency = (value: number) => {
    if (value === 0) {
      return "$0";
    }
    if (value < 1000) {
      return `$${value.toFixed(0)}`;
    }
    if (value < 1_000_000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${(value / 1_000_000).toFixed(2)}M`;
  };

  if (isLoading || !address) {
    return (
      <div className="grid w-full grid-cols-3 gap-4">
        <StatCard
          bgColor="bg-success/10"
          icon={CircleDollarSign}
          iconColor="text-success"
          label="Total Saved"
          value="..."
        />
        <StatCard
          bgColor="bg-warning/10"
          icon={Star}
          iconColor="text-warning"
          label="Active Circles"
          value="..."
        />
        <StatCard
          bgColor="bg-primary/10"
          icon={Banknote}
          iconColor="text-primary"
          label="Payouts Received"
          value="..."
        />
      </div>
    );
  }

  const groups = userGroupsData?.groups || [];

  return (
    <>
      {/* Render group stats readers */}
      {groups.map((group) => {
        if (!group.groupAddress) {
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

      <div className="grid w-full grid-cols-3 gap-4">
        {/* Total Saved */}
        <StatCard
          bgColor="bg-success/10"
          icon={CircleDollarSign}
          iconColor="text-success"
          label="Total Saved"
          value={formatCurrency(stats.totalSaved)}
        />

        {/* Active Circles */}
        <StatCard
          bgColor="bg-warning/10"
          icon={Star}
          iconColor="text-warning"
          label="Active Circles"
          value={stats.activeCircles.toString()}
        />

        {/* Payouts Received */}
        <StatCard
          bgColor="bg-primary/10"
          icon={Banknote}
          iconColor="text-primary"
          label="Payouts Received"
          value={stats?.payoutsReceived.toString()}
        />
      </div>
    </>
  );
}
