import type { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import RondaProtocolFactoryAbi from "./abis/RondaProtocolFactory.json";
import type { VerificationType } from "./hooks/use-ronda-read";

export type VerificationConfig = {
  olderThan: bigint;
  forbiddenCountries: string[];
  ofacEnabled: boolean;
};

export type DeployRondaProtocolParams = {
  factoryAddress: Address;
  scopeSeed: string;
  verificationConfig: VerificationConfig;
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

export const useDeployRondaProtocol = () => {
  const {
    writeContract,
    data: hash,
    error,
    isPending,
    isError,
    isSuccess,
    reset,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const deploy = (params: DeployRondaProtocolParams) => {
    const {
      factoryAddress,
      scopeSeed,
      verificationConfig,
      creator,
      depositFrequency,
      borrowFrequency,
      recurringAmount,
      operationCounter,
      verificationType,
      minAge,
      allowedNationalities,
      requiredGender,
      usersToInvite,
    } = params;

    // deployRondaProtocol takes a single params tuple
    writeContract({
      address: factoryAddress,
      abi: RondaProtocolFactoryAbi,
      functionName: "deployRondaProtocol",
      args: [
        {
          scopeSeed,
          verificationConfig,
          creator,
          depositFrequency,
          borrowFrequency,
          recurringAmount,
          operationCounter,
          verificationType,
          minAge,
          allowedNationalities,
          requiredGender,
          usersToInvite,
        },
      ],
    });
  };

  return {
    deploy,
    hash,
    receipt,
    error,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    isSuccess,
    reset,
  };
};
