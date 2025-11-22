"use client";

import type { Address } from "viem";
import { celo } from "viem/chains";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { RONDA_PROTOCOL_ABI } from "../config";
import type { VerificationType } from "./use-ronda-read";

// Types for write function parameters
export type CreateGroupParams = {
  creator: Address;
  depositFrequency: bigint;
  borrowFrequency: bigint;
  recurringAmount: bigint;
  operationCounter: bigint;
  verificationType: VerificationType;
  minAge: bigint;
  allowedNationalities: string[];
  requiredGender: string;
  usersToInvite: Address[];
};

// Hook to create a group
// Note: createGroup now requires _creator as the first parameter
export function useCreateGroup(contractAddress: Address | undefined) {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const write = (params: CreateGroupParams) => {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
    writeContract({
      address: contractAddress,
      abi: RONDA_PROTOCOL_ABI,
      functionName: "createGroup",
      args: [
        params.creator,
        params.depositFrequency,
        params.borrowFrequency,
        params.recurringAmount,
        params.operationCounter,
        params.verificationType,
        params.minAge,
        params.allowedNationalities,
        params.requiredGender,
        params.usersToInvite,
      ],
      chainId: celo.id,
    });
  };

  return {
    createGroup: write,
    hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  };
}

// Hook to create a group with transaction receipt waiting
export function useCreateGroupWithReceipt(
  contractAddress: Address | undefined
) {
  const { createGroup, hash, error, isPending, isError, isSuccess, reset } =
    useCreateGroup(contractAddress);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: celo.id,
  });

  return {
    createGroup,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isError,
    isSuccess,
    isConfirmed,
    reset,
  };
}

// Hook to join a group
// Note: joinGroup doesn't take groupId - it's called on the contract instance
export function useJoinGroup(contractAddress: Address | undefined) {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const write = () => {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
    writeContract({
      address: contractAddress,
      abi: RONDA_PROTOCOL_ABI,
      functionName: "joinGroup",
      args: [],
      chainId: celo.id,
    });
  };

  return {
    joinGroup: write,
    hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  };
}

// Hook to join a group with transaction receipt waiting
export function useJoinGroupWithReceipt(contractAddress: Address | undefined) {
  const { joinGroup, hash, error, isPending, isError, isSuccess, reset } =
    useJoinGroup(contractAddress);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: celo.id,
  });

  return {
    joinGroup,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isError,
    isSuccess,
    isConfirmed,
    reset,
  };
}

// Hook to deposit
// Note: deposit doesn't take groupId - it's called on the contract instance
export function useDeposit(contractAddress: Address | undefined) {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const write = () => {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
    writeContract({
      address: contractAddress,
      abi: RONDA_PROTOCOL_ABI,
      functionName: "deposit",
      args: [],
      chainId: celo.id,
    });
  };

  return {
    deposit: write,
    hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  };
}

// Hook to deposit with transaction receipt waiting
export function useDepositWithReceipt(contractAddress: Address | undefined) {
  const { deposit, hash, error, isPending, isError, isSuccess, reset } =
    useDeposit(contractAddress);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: celo.id,
  });

  return {
    deposit,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isError,
    isSuccess,
    isConfirmed,
    reset,
  };
}

// Hook to distribute funds
export function useDistributeFunds(contractAddress: Address | undefined) {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const write = (members: Address[]) => {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
    writeContract({
      address: contractAddress,
      abi: RONDA_PROTOCOL_ABI,
      functionName: "distributeFunds",
      args: [members],
      chainId: celo.id,
    });
  };

  return {
    distributeFunds: write,
    hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  };
}

// Hook to distribute funds with transaction receipt waiting
export function useDistributeFundsWithReceipt(
  contractAddress: Address | undefined
) {
  const { distributeFunds, hash, error, isPending, isError, isSuccess, reset } =
    useDistributeFunds(contractAddress);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: celo.id,
  });

  return {
    distributeFunds,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isError,
    isSuccess,
    isConfirmed,
    reset,
  };
}

// Hook to verify self proof
export function useVerifySelfProof(contractAddress: Address | undefined) {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const write = (
    proofPayload: `0x${string}`,
    userContextData: `0x${string}`
  ) => {
    if (!contractAddress) {
      throw new Error("Contract address is required");
    }
    writeContract({
      address: contractAddress,
      abi: RONDA_PROTOCOL_ABI,
      functionName: "verifySelfProof",
      args: [proofPayload, userContextData],
      chainId: celo.id,
    });
  };

  return {
    verifySelfProof: write,
    hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  };
}

// Hook to verify self proof with transaction receipt waiting
export function useVerifySelfProofWithReceipt(
  contractAddress: Address | undefined
) {
  const { verifySelfProof, hash, error, isPending, isError, isSuccess, reset } =
    useVerifySelfProof(contractAddress);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    chainId: celo.id,
  });

  return {
    verifySelfProof,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isError,
    isSuccess,
    isConfirmed,
    reset,
  };
}
