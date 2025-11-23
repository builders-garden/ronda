"use client";

import { useEffect, useRef } from "react";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import type { groups } from "@/lib/database/db.schema";
import {
  useGetGroupInfoDetailed,
  useHasUserDepositedCurrentPeriod,
} from "@/lib/smart-contracts/hooks";

type Group = typeof groups.$inferSelect;

export function GroupStatusReader({
  group,
  onStatusReady,
}: {
  group: Group;
  onStatusReady: (
    groupId: string,
    status: "active" | "deposit_due" | "completed"
  ) => void;
}) {
  const { address: userAddress } = useAccount();
  const groupAddress = group.groupAddress as Address | undefined;
  const lastStatusRef = useRef<"active" | "deposit_due" | "completed" | null>(
    null
  );

  // Read onchain data
  const { data: groupInfo } = useGetGroupInfoDetailed(
    groupAddress,
    !!groupAddress
  );
  const { data: hasDeposited } = useHasUserDepositedCurrentPeriod(
    groupAddress,
    userAddress,
    !!groupAddress && !!userAddress
  );

  useEffect(() => {
    if (!(groupInfo && groupAddress)) {
      return;
    }

    if (!groupInfo.exists) {
      return;
    }

    // Calculate total weeks and current week
    const totalWeeks = Number(groupInfo.operationCounter) || 1;
    const currentWeek = Math.min(
      Number(groupInfo.currentOperationIndex) + 1,
      totalWeeks
    );

    // Determine status
    let status: "active" | "deposit_due" | "completed" = "active";
    if (currentWeek >= totalWeeks) {
      status = "completed";
    } else if (!hasDeposited && userAddress) {
      status = "deposit_due";
    }

    // Only call onStatusReady if status has changed
    if (lastStatusRef.current !== status) {
      lastStatusRef.current = status;
      onStatusReady(group.id, status);
    }
  }, [
    group.id,
    groupInfo,
    groupAddress,
    hasDeposited,
    userAddress,
    onStatusReady,
  ]);

  return null;
}
