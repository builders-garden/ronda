"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { GroupCardWithData } from "@/components/pages/home/components/group-card-with-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserGroups } from "@/hooks/use-user-groups";
import type { CirclesPageContent } from "@/lib/enum";
import { useIsInvited, useIsMember } from "@/lib/smart-contracts/hooks";
import { GroupStatusReader } from "./components/group-status-reader";
import { InvitationCardWithData } from "./components/invitation-card-with-data";

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
  const lastStatusRef = useRef<{
    isMember: boolean;
    isInvited: boolean;
  } | null>(null);

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

  useEffect(() => {
    if (isMember !== undefined || isInvited !== undefined) {
      const currentStatus = {
        isMember: Boolean(isMember),
        isInvited: Boolean(isInvited),
      };

      // Only call onStatusReady if status has changed
      if (
        !lastStatusRef.current ||
        lastStatusRef.current.isMember !== currentStatus.isMember ||
        lastStatusRef.current.isInvited !== currentStatus.isInvited
      ) {
        lastStatusRef.current = currentStatus;
        onStatusReady(
          group.id,
          currentStatus.isMember,
          currentStatus.isInvited
        );
      }
    }
  }, [group.id, isMember, isInvited, onStatusReady]);

  return null;
}

export default function CirclesPage({
  initialPageContent,
}: {
  initialPageContent?: CirclesPageContent;
}) {
  const [activeTab, setActiveTab] = useState("active");
  const { address } = useAccount();
  const { data: userGroupsData, isLoading: isLoadingGroups } = useUserGroups({
    address: address || "",
    enabled: !!address,
  });

  // Track group statuses (member/invited)
  const [groupStatuses, setGroupStatuses] = useState<
    Map<string, { isMember: boolean; isInvited: boolean }>
  >(new Map());

  // Track group circle statuses (active/completed/deposit_due)
  const [circleStatuses, setCircleStatuses] = useState<
    Map<string, "active" | "deposit_due" | "completed">
  >(new Map());

  const handleStatusReady = useCallback(
    (groupId: string, isMember: boolean, isInvited: boolean) => {
      setGroupStatuses((prev) => {
        const next = new Map(prev);
        next.set(groupId, { isMember, isInvited });
        return next;
      });
    },
    []
  );

  const handleCircleStatusReady = useCallback(
    (groupId: string, status: "active" | "deposit_due" | "completed") => {
      setCircleStatuses((prev) => {
        const next = new Map(prev);
        next.set(groupId, status);
        return next;
      });
    },
    []
  );

  // Filter groups by status
  const { activeGroups, completedGroups, invitedGroups } = useMemo(() => {
    if (!userGroupsData?.groups) {
      return { activeGroups: [], completedGroups: [], invitedGroups: [] };
    }

    const active: typeof userGroupsData.groups = [];
    const completed: typeof userGroupsData.groups = [];
    const invited: typeof userGroupsData.groups = [];

    for (const group of userGroupsData.groups) {
      const status = groupStatuses.get(group.id);
      const circleStatus = circleStatuses.get(group.id);

      // If user is invited but not a member, it's an invitation
      if (status?.isInvited && !status?.isMember) {
        invited.push(group);
        continue;
      }

      // If user is a member, check circle status from onchain data
      if (status?.isMember && circleStatus) {
        if (circleStatus === "completed") {
          completed.push(group);
        } else {
          // active or deposit_due both go to active tab
          active.push(group);
        }
      }
    }

    return {
      activeGroups: active,
      completedGroups: completed,
      invitedGroups: invited,
    };
  }, [userGroupsData?.groups, groupStatuses, circleStatuses]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative mt-0 flex min-h-screen w-full flex-col items-center justify-start bg-white pt-0 pb-20"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Check group statuses (member/invited) */}
      {userGroupsData?.groups.map((group) => (
        <GroupStatusChecker
          group={group}
          key={group.id}
          onStatusReady={handleStatusReady}
          userAddress={address}
        />
      ))}

      {/* Check circle statuses (active/completed) for member groups */}
      {userGroupsData?.groups
        .filter((group) => {
          const status = groupStatuses.get(group.id);
          return status?.isMember;
        })
        .map((group) => (
          <GroupStatusReader
            group={group}
            key={`status-${group.id}`}
            onStatusReady={handleCircleStatusReady}
          />
        ))}

      {/* Header */}
      <div className="sticky top-0 z-10 flex w-full items-center justify-center border-border/50 border-b bg-white px-6 py-4">
        <h1 className="font-bold text-[20px] text-zinc-950 tracking-tight">
          Your Circles
        </h1>
      </div>

      {/* Tabs */}
      <Tabs
        className="w-full"
        defaultValue="active"
        onValueChange={setActiveTab}
      >
        <div className="border-border/50 border-b px-6 py-6">
          <TabsList className="h-auto w-auto bg-transparent p-0">
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pr-7 pb-[22px] font-semibold text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="active"
            >
              Active
              {activeTab === "active" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pr-7 pb-[22px] font-medium text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="completed"
            >
              Completed
              {activeTab === "completed" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              className="relative h-6 rounded-none border-0 bg-transparent px-0 pb-[22px] font-medium text-[14px] text-muted-foreground shadow-none transition-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-muted data-[state=active]:shadow-none"
              value="invites"
            >
              Invites
              {activeTab === "invites" && (
                <motion.div
                  className="absolute right-0 bottom-0 left-0 h-[2px] rounded-full bg-primary"
                  layoutId="activeTab"
                />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0 px-6 py-6" value="active">
          <div className="flex flex-col gap-4">
            {isLoadingGroups ? (
              <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                Loading circles...
              </div>
            ) : activeGroups.length > 0 ? (
              activeGroups.map((group) => (
                <GroupCardWithData
                  group={group}
                  initialPageContent={initialPageContent}
                  key={group.id}
                />
              ))
            ) : (
              <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                No active circles
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 px-6 py-6" value="completed">
          <div className="flex flex-col gap-4">
            {isLoadingGroups ? (
              <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                Loading circles...
              </div>
            ) : completedGroups.length > 0 ? (
              completedGroups.map((group) => (
                <GroupCardWithData
                  group={group}
                  initialPageContent={initialPageContent}
                  key={group.id}
                />
              ))
            ) : (
              <div className="flex w-full items-center justify-center py-8 text-[#6f7780] text-sm">
                No completed circles
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-0 px-6 py-6" value="invites">
          <div className="flex flex-col gap-4">
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
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
