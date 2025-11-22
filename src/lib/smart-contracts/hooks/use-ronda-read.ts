"use client";

import type { Address } from "viem";
import { celo } from "viem/chains";
import { useReadContract } from "wagmi";
import { RONDA_PROTOCOL_ABI } from "../config";

// Types based on the contract ABI
export type VerificationType = 0 | 1 | 2; // enum VerificationType

export type GroupInfo = {
  creator: Address;
  verificationType: VerificationType;
  depositFrequency: bigint;
  borrowFrequency: bigint;
  recurringAmount: bigint;
  operationCounter: bigint;
  currentOperationIndex: bigint;
  lastDepositTime: bigint;
  lastBorrowTime: bigint;
  minAge: bigint;
  allowedNationalities: string[];
  requiredGender: string;
};

export interface GroupInfoDetailed extends GroupInfo {
  currentPeriodDeposits: bigint;
  exists: boolean;
}

export interface GroupInfoWithId extends GroupInfoDetailed {
  groupId: bigint;
}

export type UserDepositStatus = {
  depositedPeriods: boolean[];
  totalPeriods: bigint;
};

// Hook to get basic group info
// Note: This function doesn't take groupId - it's called on the contract instance
export function useGetGroupInfo(
  contractAddress: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "getGroupInfo",
    args: undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined,
    },
  });
}

// Hook to get detailed group info
// Note: This function doesn't take groupId - it's called on the contract instance
export function useGetGroupInfoDetailed(
  contractAddress: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "getGroupInfoDetailed",
    args: undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined,
    },
  });
}

// Hook to check if user has deposited in a specific period
// Note: Parameters are _operationIndex, _user (no groupId needed)
export function useHasUserDeposited(
  contractAddress: Address | undefined,
  operationIndex: bigint | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "hasUserDeposited",
    args:
      contractAddress !== undefined &&
      operationIndex !== undefined &&
      user !== undefined
        ? [operationIndex, user]
        : undefined,
    chainId: celo.id,
    query: {
      enabled:
        enabled &&
        contractAddress !== undefined &&
        operationIndex !== undefined &&
        user !== undefined,
    },
  });
}

// Hook to check if user has deposited in current period
// Note: Only takes _user parameter (no groupId needed)
export function useHasUserDepositedCurrentPeriod(
  contractAddress: Address | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "hasUserDepositedCurrentPeriod",
    args:
      contractAddress !== undefined && user !== undefined ? [user] : undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined && user !== undefined,
    },
  });
}

// Hook to check if user has deposited in a specific period (alternative function)
// Note: Parameters are _user, _operationIndex (no groupId needed)
export function useHasUserDepositedInPeriod(
  contractAddress: Address | undefined,
  user: Address | undefined,
  operationIndex: bigint | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "hasUserDepositedInPeriod",
    args:
      contractAddress !== undefined &&
      user !== undefined &&
      operationIndex !== undefined
        ? [user, operationIndex]
        : undefined,
    chainId: celo.id,
    query: {
      enabled:
        enabled &&
        contractAddress !== undefined &&
        user !== undefined &&
        operationIndex !== undefined,
    },
  });
}

// Hook to get user deposit status for all periods
// Note: Only takes _user parameter (no groupId needed)
export function useGetUserDepositStatusForAllPeriods(
  contractAddress: Address | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "getUserDepositStatusForAllPeriods",
    args:
      contractAddress !== undefined && user !== undefined ? [user] : undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined && user !== undefined,
    },
  });
}

// Hook to get period deposits
// Note: Only takes _operationIndex parameter (no groupId needed)
export function useGetPeriodDeposits(
  contractAddress: Address | undefined,
  operationIndex: bigint | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "getPeriodDeposits",
    args:
      contractAddress !== undefined && operationIndex !== undefined
        ? [operationIndex]
        : undefined,
    chainId: celo.id,
    query: {
      enabled:
        enabled &&
        contractAddress !== undefined &&
        operationIndex !== undefined,
    },
  });
}

// Hook to get groupId from contract instance
export function useGetGroupId(
  contractAddress: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "groupId",
    args: undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined,
    },
  });
}

// Hook to check if user is a member
export function useIsMember(
  contractAddress: Address | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "isMember",
    args:
      contractAddress !== undefined && user !== undefined ? [user] : undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined && user !== undefined,
    },
  });
}

// Hook to check if user is invited
export function useIsInvited(
  contractAddress: Address | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "isInvited",
    args:
      contractAddress !== undefined && user !== undefined ? [user] : undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined && user !== undefined,
    },
  });
}

// Hook to check if user is verified
export function useIsUserVerified(
  contractAddress: Address | undefined,
  user: Address | undefined,
  enabled = true
) {
  return useReadContract({
    address: contractAddress,
    abi: RONDA_PROTOCOL_ABI,
    functionName: "isUserVerified",
    args:
      contractAddress !== undefined && user !== undefined ? [user] : undefined,
    chainId: celo.id,
    query: {
      enabled: enabled && contractAddress !== undefined && user !== undefined,
    },
  });
}
