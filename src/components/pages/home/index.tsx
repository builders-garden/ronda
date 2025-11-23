"use client";

import { Plus, Star, UsersRound, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { InvitationCardWithData } from "@/components/pages/circles/components/invitation-card-with-data";
import { useUserGroups } from "@/hooks/use-user-groups";
import { useUserStats } from "@/hooks/use-user-stats";
import { useIsInvited, useIsMember } from "@/lib/smart-contracts/hooks";
import { CreateRondaModal } from "./components/create-ronda-modal";
import { GroupCardWithData } from "./components/group-card-with-data";
import { HomeHeader } from "./components/home-header";
import { SummaryCard } from "./components/summary-card";

// Format currency value
function formatCurrency(value: number): string {
  if (value === 0) {
    return "$0";
  }
  if (value < 1000) {
    return `$${value.toFixed(0)}`;
  }
  if (value < 1_000_000) {
    // Format with comma for thousands
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${(value / 1_000_000).toFixed(2)}M`;
}

// Component to check membership/invitation status for a group
function GroupStatusChecker({
  group,
  userAddress,
  onStatusReady,
}: {
  group: { id: string; groupAddress: string | null };
  userAddress: Address | undefined;
  onStatusReady: (
    groupId: string,
    isMember: boolean,
    isInvited: boolean
  ) => void;
}) {
  const groupAddress = group.groupAddress as Address | undefined;
  const { data: isMember } = useIsMember(
    groupAddress,
    userAddress,
    !!groupAddress && !!userAddress
  );
  const { data: isInvited } = useIsInvited(
    groupAddress,
    userAddress,
    !!groupAddress && !!userAddress
  );

  const lastStatusRef = useRef<string>("");
  const isEnabled = !!groupAddress && !!userAddress;

  useEffect(() => {
    // If the query is not enabled (no groupAddress or userAddress), report default status
    if (!isEnabled) {
      const status = { isMember: false, isInvited: false };
      const statusKey = JSON.stringify(status);
      if (lastStatusRef.current !== statusKey) {
        lastStatusRef.current = statusKey;
        onStatusReady(group.id, false, false);
      }
      return;
    }

    // If enabled, wait for both queries to complete
    if (isMember === undefined || isInvited === undefined) {
      return;
    }

    const status = {
      isMember: Boolean(isMember),
      isInvited: Boolean(isInvited),
    };
    const statusKey = JSON.stringify(status);

    if (lastStatusRef.current !== statusKey) {
      lastStatusRef.current = statusKey;
      onStatusReady(group.id, status.isMember, status.isInvited);
    }
  }, [group.id, isEnabled, isMember, isInvited, onStatusReady]);

  return null;
}

export default function HomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { address } = useAccount();
  const { totalSaved, activeCircles, reliability, isLoading, readers } =
    useUserStats();
  const { data: userGroupsData, isLoading: isLoadingGroups } = useUserGroups({
    address: address || "",
    enabled: !!address,
  });

  console.log("USER GROUPS DATA", { userGroupsData });

  // Track group statuses (member/invited)
  const [groupStatuses, setGroupStatuses] = useState<
    Map<string, { isMember: boolean; isInvited: boolean }>
  >(new Map());

  const handleStatusReady = useCallback(
    (groupId: string, isMember: boolean, isInvited: boolean) => {
      setGroupStatuses((prev) => {
        const existingStatus = prev.get(groupId);
        const newStatus = { isMember, isInvited };

        // Only update if the status has actually changed
        if (
          existingStatus &&
          existingStatus.isMember === newStatus.isMember &&
          existingStatus.isInvited === newStatus.isInvited
        ) {
          return prev;
        }

        const next = new Map(prev);
        next.set(groupId, newStatus);
        return next;
      });
    },
    []
  );

  // Filter groups - separate active circles and invitations
  const { activeCirclesList, invitedGroups } = useMemo(() => {
    if (!userGroupsData?.groups) {
      return { activeCirclesList: [], invitedGroups: [] };
    }

    const active: typeof userGroupsData.groups = [];
    const invited: typeof userGroupsData.groups = [];

    for (const group of userGroupsData.groups) {
      const status = groupStatuses.get(group.id);

      console.log("GROUP NAME", {
        groupName: group.name,
        status,
      });

      // If we don't have status yet, default to showing as active member
      // This prevents the UI from being empty while statuses load
      if (!status) {
        active.push(group);
        continue;
      }

      // If user is invited but not a member, it's an invitation
      if (status.isInvited && !status.isMember) {
        invited.push(group);
        continue;
      }

      // If user is a member, add to active circles
      if (status.isMember) {
        active.push(group);
      }
    }

    return { activeCirclesList: active, invitedGroups: invited };
  }, [userGroupsData?.groups, groupStatuses]);

  return (
    <>
      {/* Render group stats readers */}
      {readers}

      {/* Check group statuses (member/invited) */}
      {userGroupsData?.groups.map((group) => (
        <GroupStatusChecker
          group={group}
          key={group.id}
          onStatusReady={handleStatusReady}
          userAddress={address}
        />
      ))}

      <motion.div
        animate={{ opacity: 1 }}
        className="relative flex w-full flex-col items-center justify-start bg-white pb-24"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <HomeHeader />

        {/* Main Content */}
        <div className="flex w-full flex-col items-center justify-start gap-8 px-6 pt-8">
          {/* Summary Cards */}
          <div className="grid w-full grid-cols-3 gap-3">
            <SummaryCard
              bgColor="bg-muted/5"
              icon={Wallet}
              iconColor="text-muted"
              label="Total Saved"
              value={isLoading ? "..." : formatCurrency(totalSaved)}
            />
            <SummaryCard
              bgColor="bg-primary/10"
              icon={UsersRound}
              iconColor="text-primary"
              label="Active Circles"
              value={isLoading ? "..." : activeCircles.toString()}
            />
            <SummaryCard
              bgColor="bg-warning/10"
              icon={Star}
              iconColor="text-warning"
              label="Reliability"
              value={isLoading ? "..." : `${reliability}%`}
            />
          </div>

          {/* Create New Circle Button */}
          <motion.button
            className="flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-[24px] bg-linear-to-b from-primary to-primary/80"
            onClick={() => setIsCreateModalOpen(true)}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="size-5 text-white" strokeWidth={2.5} />
            <span className="font-semibold text-[16px] text-white tracking-[-0.4px]">
              Create New Circle
            </span>
          </motion.button>

          {/* Your Circles */}
          <div className="flex w-full flex-col items-center justify-start gap-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="font-bold text-[20px] text-zinc-950 tracking-[-0.5px]">
                Your Circles
              </h2>
              <motion.button
                className="cursor-pointer font-semibold text-[14px] text-zinc-900 tracking-[-0.35px] hover:underline"
                whileTap={{ scale: 0.98 }}
              >
                View All
              </motion.button>
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-4">
              {isLoadingGroups ? (
                <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                  Loading circles...
                </div>
              ) : activeCirclesList.length > 0 ? (
                activeCirclesList.map((group) => (
                  <GroupCardWithData group={group} key={group.id} />
                ))
              ) : (
                <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                  No circles yet. Create your first circle!
                </div>
              )}
            </div>
          </div>

          {/* Invitations */}
          <div className="flex w-full flex-col items-center justify-start gap-4">
            <div className="flex w-full items-center justify-between">
              <h2 className="font-bold text-[20px] text-zinc-950 tracking-[-0.5px]">
                Invitations
              </h2>
              {invitedGroups.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-red-500">
                    <span className="font-bold text-[12px] text-white">
                      {invitedGroups.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-start gap-4">
              {isLoadingGroups ? (
                <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                  Loading invitations...
                </div>
              ) : invitedGroups.length > 0 ? (
                invitedGroups.map((group) => (
                  <InvitationCardWithData group={group} key={group.id} />
                ))
              ) : (
                <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                  No pending invitations
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Ronda Modal */}
      <CreateRondaModal
        onOpenChange={setIsCreateModalOpen}
        open={isCreateModalOpen}
      />
    </>
  );
}
