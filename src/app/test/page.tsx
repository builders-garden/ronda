"use client";

import sdk from "@farcaster/miniapp-sdk";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { getUniversalLink } from "@selfxyz/core";
import { SelfAppBuilder, SelfQRcodeWrapper } from "@selfxyz/qrcode";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Address } from "viem";
import { decodeEventLog } from "viem";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { env } from "@/lib/env";
import RondaProtocolFactoryAbi from "@/lib/smart-contracts/abis/RondaProtocolFactory.json";
import {
  type CreateGroupParams,
  type GroupInfo,
  type GroupInfoDetailed,
  useCreateGroupWithReceipt,
  useDepositWithReceipt,
  useGetGroupId,
  useGetGroupInfo,
  useGetGroupInfoDetailed,
  useJoinGroupWithReceipt,
  type VerificationType,
} from "@/lib/smart-contracts/hooks";
import {
  type DeployRondaProtocolParams,
  useDeployRondaProtocol,
} from "@/lib/smart-contracts/use-deploy-ronda-protocol";

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const [contractAddress, setContractAddress] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [selfDeeplink, setSelfDeeplink] = useState<string>("");
  // biome-ignore lint/suspicious/noExplicitAny: SelfAppBuilder.build() return type is not exported
  const [selfApp, setSelfApp] = useState<any>(null);
  const [verificationSuccess, setVerificationSuccess] =
    useState<boolean>(false);
  const { connect } = useConnect();
  const searchParams = useSearchParams();
  const hasOpenedDeeplink = useRef<boolean>(false);

  // Factory address from env
  const factoryAddress = env.NEXT_PUBLIC_RONDA_FACTORY_ADDRESS as Address;

  // Use contract address from decoded deployment receipt (set in useEffect below)
  const effectiveContractAddress: Address | undefined = contractAddress
    ? (contractAddress.toLowerCase() as Address)
    : undefined;

  // Deployment hook
  const {
    deploy,
    hash: deployHash,
    receipt: deployReceipt,
    isPending: isDeploying,
    isConfirmed: isDeployConfirmed,
    error: deployError,
  } = useDeployRondaProtocol();

  // Contract write hooks - now require contract address
  const {
    createGroup,
    hash: createHash,
    receipt: _createReceipt,
    isPending: isCreating,
    isConfirmed: isCreateConfirmed,
    error: createError,
  } = useCreateGroupWithReceipt(effectiveContractAddress);

  const {
    joinGroup,
    hash: joinHash,
    receipt: _joinReceipt,
    isPending: isJoining,
    isConfirmed: isJoinConfirmed,
    error: joinError,
  } = useJoinGroupWithReceipt(effectiveContractAddress);

  const {
    deposit,
    hash: depositHash,
    receipt: _depositReceipt,
    isPending: isDepositing,
    isConfirmed: isDepositConfirmed,
    error: depositError,
  } = useDepositWithReceipt(effectiveContractAddress);

  // Contract read hooks - now use contract address
  const {
    data: groupInfo,
    isLoading: isLoadingGroupInfo,
    error: _readError,
  } = useGetGroupInfo(
    effectiveContractAddress,
    Boolean(effectiveContractAddress)
  );

  const { data: groupInfoDetailed, isLoading: isLoadingGroupInfoDetailed } =
    useGetGroupInfoDetailed(
      effectiveContractAddress,
      Boolean(effectiveContractAddress)
    );

  // Get group ID from contract
  const { data: groupIdFromContract } = useGetGroupId(
    effectiveContractAddress,
    Boolean(effectiveContractAddress)
  );

  // Transform tuple data to object format (memoized to prevent unnecessary re-renders)
  const typedGroupInfo: GroupInfo | undefined = useMemo(() => {
    if (!groupInfo) {
      return;
    }
    return {
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      creator: (groupInfo as any)[0] as Address,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      verificationType: (groupInfo as any)[1] as VerificationType,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      depositFrequency: (groupInfo as any)[2] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      borrowFrequency: (groupInfo as any)[3] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      recurringAmount: (groupInfo as any)[4] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      operationCounter: (groupInfo as any)[5] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      currentOperationIndex: (groupInfo as any)[6] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      lastDepositTime: (groupInfo as any)[7] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      lastBorrowTime: (groupInfo as any)[8] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      minAge: (groupInfo as any)[9] as bigint,
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      allowedNationalities: (groupInfo as any)[10] as string[],
      // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
      requiredGender: (groupInfo as any)[11] as string,
    };
  }, [groupInfo]);

  const typedGroupInfoDetailed: GroupInfoDetailed | undefined =
    groupInfoDetailed
      ? {
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          creator: (groupInfoDetailed as any)[0] as Address,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          verificationType: (groupInfoDetailed as any)[1] as VerificationType,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          depositFrequency: (groupInfoDetailed as any)[2] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          borrowFrequency: (groupInfoDetailed as any)[3] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          recurringAmount: (groupInfoDetailed as any)[4] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          operationCounter: (groupInfoDetailed as any)[5] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          currentOperationIndex: (groupInfoDetailed as any)[6] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          lastDepositTime: (groupInfoDetailed as any)[7] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          lastBorrowTime: (groupInfoDetailed as any)[8] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          minAge: (groupInfoDetailed as any)[9] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          allowedNationalities: (groupInfoDetailed as any)[10] as string[],
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          requiredGender: (groupInfoDetailed as any)[11] as string,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          currentPeriodDeposits: (groupInfoDetailed as any)[12] as bigint,
          // biome-ignore lint/suspicious/noExplicitAny: Contract returns tuple data that needs to be cast
          exists: (groupInfoDetailed as any)[13] as boolean,
        }
      : undefined;

  // Deployment parameters state
  const [deploymentParams, setDeploymentParams] = useState<
    Partial<DeployRondaProtocolParams>
  >({
    scopeSeed: "ronda-test",
    verificationConfig: {
      olderThan: BigInt(18),
      forbiddenCountries: [],
      ofacEnabled: false,
    },
    depositFrequency: BigInt(7), // 7 days
    borrowFrequency: BigInt(7), // 7 days
    recurringAmount: BigInt(1000000), // 1 USDC (6 decimals)
    operationCounter: BigInt(4), // 4 operations
    verificationType: 0 as VerificationType, // 0 = None
    minAge: BigInt(18),
    allowedNationalities: [],
    requiredGender: "",
    usersToInvite: [],
  });

  // Form state for creating group (uses same values as deployment)
  const [formData, setFormData] = useState<Partial<CreateGroupParams>>({
    creator: address as Address | undefined,
    depositFrequency: BigInt(7), // 7 days
    borrowFrequency: BigInt(7), // 7 days
    recurringAmount: BigInt(1000000), // 1 USDC (6 decimals)
    operationCounter: BigInt(4), // 4 operations
    verificationType: 0 as VerificationType, // 0 = None
    minAge: BigInt(18),
    allowedNationalities: [],
    requiredGender: "",
    usersToInvite: [],
  });

  // Update creator when address changes
  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, creator: address as Address }));
      setDeploymentParams((prev) => ({ ...prev, creator: address as Address }));
    }
  }, [address]);

  // Sync form data with deployment params (for create group)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      depositFrequency:
        deploymentParams.depositFrequency || prev.depositFrequency,
      borrowFrequency: deploymentParams.borrowFrequency || prev.borrowFrequency,
      recurringAmount: deploymentParams.recurringAmount || prev.recurringAmount,
      operationCounter:
        deploymentParams.operationCounter || prev.operationCounter,
      verificationType:
        deploymentParams.verificationType || prev.verificationType,
      minAge: deploymentParams.minAge || prev.minAge,
      allowedNationalities:
        deploymentParams.allowedNationalities || prev.allowedNationalities,
      requiredGender: deploymentParams.requiredGender || prev.requiredGender,
      usersToInvite: deploymentParams.usersToInvite || prev.usersToInvite,
    }));
  }, [deploymentParams]);

  useEffect(() => {
    if (!(isConnected && address)) {
      connect({ connector: miniAppConnector() });
    }
  }, [isConnected, address, connect]);

  // Memoize key values from deploymentParams to prevent infinite loops
  const verificationOlderThan = useMemo(
    () => deploymentParams.verificationConfig?.olderThan?.toString() || "0",
    [deploymentParams.verificationConfig?.olderThan]
  );
  const verificationOfacEnabled = useMemo(
    () => deploymentParams.verificationConfig?.ofacEnabled,
    [deploymentParams.verificationConfig?.ofacEnabled]
  );
  const allowedNationalitiesStr = useMemo(
    () => deploymentParams.allowedNationalities?.join(",") || "",
    [deploymentParams.allowedNationalities]
  );
  const requiredGenderStr = useMemo(
    () => deploymentParams.requiredGender || "",
    [deploymentParams.requiredGender]
  );
  const scopeSeedStr = useMemo(
    () => deploymentParams.scopeSeed || "ronda-test",
    [deploymentParams.scopeSeed]
  );

  // Memoize typedGroupInfo values to prevent infinite loops
  const groupVerificationType = useMemo(
    () => typedGroupInfo?.verificationType,
    [typedGroupInfo?.verificationType]
  );
  const groupAllowedNationalitiesStr = useMemo(
    () => typedGroupInfo?.allowedNationalities?.join(",") || "",
    [typedGroupInfo?.allowedNationalities]
  );
  const groupRequiredGenderStr = useMemo(
    () => typedGroupInfo?.requiredGender || "",
    [typedGroupInfo?.requiredGender]
  );
  const groupMinAge = useMemo(
    () => typedGroupInfo?.minAge?.toString() || "0",
    [typedGroupInfo?.minAge]
  );

  // Initialize/Update Self App when contract is deployed or parameters change
  useEffect(() => {
    if (!(address && effectiveContractAddress)) {
      return;
    }

    // Don't reinitialize if we're already verified (prevents loop)
    if (verificationSuccess) {
      return;
    }

    try {
      // Map contract verification requirements to Self disclosures
      const disclosures: {
        nationality?: boolean;
        gender?: boolean;
        date_of_birth?: boolean;
        minimumAge?: number;
        ofac?: boolean;
      } = {};

      // Priority 1: Use group info from contract if available
      const hasGroupInfo = groupVerificationType !== undefined;

      if (
        hasGroupInfo &&
        (groupVerificationType === 1 || groupVerificationType === 2)
      ) {
        // Use group info from contract
        if (groupAllowedNationalitiesStr) {
          disclosures.nationality = true;
        }
        if (groupRequiredGenderStr) {
          disclosures.gender = true;
        }
        if (groupMinAge !== "0") {
          disclosures.date_of_birth = true;
          disclosures.minimumAge = Number(groupMinAge);
        }
        // OFAC is always enabled for verification type 1 or 2
        disclosures.ofac = true;
      } else {
        // Priority 2: Use deployment params (when group not yet created or verificationType is 0)
        // Always set disclosures from deployment params as fallback
        if (verificationOlderThan !== "0") {
          disclosures.date_of_birth = true;
          disclosures.minimumAge = Number(verificationOlderThan);
        }
        if (verificationOfacEnabled) {
          disclosures.ofac = true;
        }
        if (allowedNationalitiesStr) {
          disclosures.nationality = true;
        }
        if (requiredGenderStr) {
          disclosures.gender = true;
        }
      }

      console.log("Building Self App with disclosures:", disclosures);
      console.log("Contract address:", effectiveContractAddress);
      console.log("Scope:", scopeSeedStr);
      console.log("User address:", address);

      const app = new SelfAppBuilder({
        appName: "Ronda Protocol",
        scope: scopeSeedStr,
        userId: address,
        userIdType: "hex",
        endpoint: effectiveContractAddress.toLowerCase(),
        deeplinkCallback:
          "https://farcaster.xyz/miniapps/lnjFQwjNJNYE/revu-tunnel/test?verified=true",
        endpointType: "celo",
        userDefinedData: "Verify your identity to join the group",
        disclosures,
      }).build();

      console.log("Self App created:", app);
      console.log("Self App Disclosures:", disclosures);

      setSelfApp(app);
      const deeplink = getUniversalLink(app);
      console.log("Deeplink generated:", deeplink);
      setSelfDeeplink(deeplink);
    } catch (error) {
      console.error("Error initializing Self App:", error);
    }
  }, [
    address,
    effectiveContractAddress,
    scopeSeedStr,
    verificationOlderThan,
    verificationOfacEnabled,
    allowedNationalitiesStr,
    requiredGenderStr,
    groupVerificationType,
    groupAllowedNationalitiesStr,
    groupRequiredGenderStr,
    groupMinAge,
    verificationSuccess,
  ]);

  const handleCreateGroup = () => {
    if (
      !(
        formData.depositFrequency &&
        formData.borrowFrequency &&
        formData.creator &&
        effectiveContractAddress
      )
    ) {
      return;
    }

    createGroup({
      creator: formData.creator,
      depositFrequency: formData.depositFrequency,
      borrowFrequency: formData.borrowFrequency,
      recurringAmount: formData.recurringAmount || BigInt(0),
      operationCounter: formData.operationCounter || BigInt(0),
      verificationType: formData.verificationType || (0 as VerificationType),
      minAge: formData.minAge || BigInt(0),
      allowedNationalities: formData.allowedNationalities || [],
      requiredGender: formData.requiredGender || "",
      usersToInvite: formData.usersToInvite || [],
    });
  };

  const handleJoinGroup = () => {
    if (!effectiveContractAddress) {
      return;
    }
    joinGroup();
  };

  const handleDeposit = () => {
    if (!effectiveContractAddress) {
      return;
    }
    deposit();
  };

  const handleOpenSelf = async () => {
    if (selfDeeplink && !verificationSuccess && !hasOpenedDeeplink.current) {
      hasOpenedDeeplink.current = true;
      await sdk.actions.openUrl(selfDeeplink);
    }
  };

  // Extract contract address from deployment receipt (decoded transaction hash)
  useEffect(() => {
    if (deployReceipt?.logs) {
      try {
        // Decode the RondaProtocolDeployed event from the logs
        for (const log of deployReceipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: RondaProtocolFactoryAbi,
              data: log.data,
              topics: log.topics,
            });

            if (decoded.eventName === "RondaProtocolDeployed" && decoded.args) {
              const args = decoded.args as unknown as {
                groupId: bigint;
                rondaProtocol: Address;
                deployer: Address;
                salt: `0x${string}`;
              };
              const deployedAddress = args.rondaProtocol;
              console.log(
                "Deployed contract address from decoded transaction:",
                deployedAddress
              );
              setContractAddress(deployedAddress);
              // Also extract and set the group ID for reference
              setGroupId(String(args.groupId));
              break;
            }
          } catch (_error) {
            // Ignore errors for events that don't match
          }
        }
      } catch (error) {
        console.error("Error decoding deployment event:", error);
      }
    }
  }, [deployReceipt]);

  // Handle verified=true query parameter (only once)
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true" && !verificationSuccess) {
      setVerificationSuccess(true);
      hasOpenedDeeplink.current = false; // Reset for potential re-verification
      console.log("Self verification successful!");
    }
  }, [searchParams, verificationSuccess]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl text-black">
          Contract & Self Integration Test
        </h1>
        <p className="text-black">
          Test Ronda Protocol contract functions and Self verification
        </p>
      </div>

      {!isConnected && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Please connect your wallet to use this page
            </p>
          </CardContent>
        </Card>
      )}

      {verificationSuccess && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-green-700">
                ✓ Self Verification Successful!
              </p>
            </div>
            <p className="mt-2 text-green-600 text-sm">
              Your identity has been verified. You can now proceed with joining
              the group or making deposits.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Self Integration Section */}
        <Card>
          <CardHeader>
            <CardTitle>Self Verification</CardTitle>
            <CardDescription>
              Test Self deeplinking and QR code integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile: Show deep link button */}
            <div className="space-y-4 md:hidden">
              <Button
                className="w-full"
                disabled={!selfDeeplink || verificationSuccess}
                onClick={handleOpenSelf}
              >
                {verificationSuccess ? "Already Verified ✓" : "Open Self App"}
              </Button>
              {selfDeeplink && (
                <div className="space-y-2">
                  <Label>Deep Link URL</Label>
                  <Textarea
                    className="font-mono text-xs"
                    readOnly
                    rows={3}
                    value={selfDeeplink}
                  />
                </div>
              )}
            </div>

            {/* Desktop: Show QR code */}
            <div className="hidden space-y-4 md:block">
              {selfApp && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-lg bg-white p-4">
                    {selfApp ? (
                      <SelfQRcodeWrapper
                        onError={(error) =>
                          console.error("Self verification error:", error)
                        }
                        onSuccess={() =>
                          console.log("Self verification successful")
                        }
                        selfApp={selfApp}
                      />
                    ) : (
                      <QRCodeSVG size={256} value={selfDeeplink} />
                    )}
                  </div>
                  <Button onClick={handleOpenSelf} variant="outline">
                    Open Self App (Deep Link)
                  </Button>
                </div>
              )}
            </div>

            {/* Show both on all devices */}
            <div className="space-y-2">
              <Label>Configuration</Label>
              <div className="space-y-1 text-muted-foreground text-sm">
                <p>Scope: {deploymentParams.scopeSeed || "ronda-test"}</p>
                <p>
                  Endpoint (Contract): {effectiveContractAddress || "Not set"}
                </p>
                <p>Redirect: {env.NEXT_PUBLIC_URL}/test</p>
                <p>Callback: {env.NEXT_PUBLIC_URL}/test?verified=true</p>
              </div>
              {selfApp && (
                <div className="mt-2 rounded-md border bg-gray-100 p-2">
                  <Label className="font-semibold text-black text-xs">
                    Self App Disclosures:
                  </Label>
                  <pre className="mt-1 rounded border bg-white p-2 font-mono text-black text-xs">
                    {JSON.stringify(
                      // biome-ignore lint/suspicious/noExplicitAny: SelfAppBuilder type doesn't export disclosures property
                      (selfApp as any).disclosures || {},
                      null,
                      2
                    ).concat(`\n\nAddress: ${address}`)}
                  </pre>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                disabled={
                  !(selfDeeplink && effectiveContractAddress) ||
                  verificationSuccess
                }
                onClick={handleOpenSelf}
              >
                {verificationSuccess
                  ? "Already Verified ✓"
                  : "Open Self App (Deep Link)"}
              </Button>
              {verificationSuccess && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setVerificationSuccess(false);
                    hasOpenedDeeplink.current = false;
                  }}
                  variant="outline"
                >
                  Reset Verification (for testing)
                </Button>
              )}
              {!effectiveContractAddress && (
                <p className="mt-1 text-muted-foreground text-xs">
                  Deploy a contract first to set the endpoint
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract Read Functions */}
        <Card>
          <CardHeader>
            <CardTitle>Read Contract Functions</CardTitle>
            <CardDescription>Query group information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black" htmlFor="read-contract-address">
                Contract Address
              </Label>
              <Input
                id="read-contract-address"
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter contract address"
                type="text"
                value={contractAddress}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-black" htmlFor="read-group-id">
                Group ID (for reference only)
              </Label>
              <Input
                id="read-group-id"
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Enter group ID"
                type="text"
                value={groupId}
              />
              <p className="text-muted-foreground text-xs">
                Group ID is extracted from deployment receipt. Contract address
                comes from decoded transaction hash.
              </p>
            </div>
            {effectiveContractAddress && (
              <div className="rounded-md border bg-gray-100 p-2 text-sm">
                <p className="font-semibold text-black">
                  Using Contract Address:
                </p>
                <p className="break-all font-mono text-black text-xs">
                  {effectiveContractAddress}
                </p>
                {groupIdFromContract !== undefined && (
                  <p className="mt-1 text-black">
                    Group ID: {String(groupIdFromContract)}
                  </p>
                )}
              </div>
            )}

            {effectiveContractAddress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-black">Group Info</Label>
                  {isLoadingGroupInfo ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : typedGroupInfo ? (
                    <div className="space-y-1 rounded-md border bg-gray-100 p-4 font-mono text-sm">
                      <p className="text-black">
                        Creator: {String(typedGroupInfo.creator)}
                      </p>
                      <p className="text-black">
                        Verification Type:{" "}
                        {String(typedGroupInfo.verificationType)}
                      </p>
                      <p className="text-black">
                        Deposit Frequency:{" "}
                        {String(typedGroupInfo.depositFrequency)}
                      </p>
                      <p className="text-black">
                        Borrow Frequency:{" "}
                        {String(typedGroupInfo.borrowFrequency)}
                      </p>
                      <p className="text-black">
                        Recurring Amount:{" "}
                        {String(typedGroupInfo.recurringAmount)}
                      </p>
                      <p className="text-black">
                        Operation Counter:{" "}
                        {String(typedGroupInfo.operationCounter)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No group found or error occurred
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-black">Group Info Detailed</Label>
                  {isLoadingGroupInfoDetailed ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  ) : typedGroupInfoDetailed ? (
                    <div className="space-y-1 rounded-md border bg-gray-100 p-4 font-mono text-sm">
                      <p className="text-black">
                        Exists: {String(typedGroupInfoDetailed.exists)}
                      </p>
                      <p className="text-black">
                        Current Period Deposits:{" "}
                        {String(typedGroupInfoDetailed.currentPeriodDeposits)}
                      </p>
                      <p className="text-black">
                        Current Operation Index:{" "}
                        {String(typedGroupInfoDetailed.currentOperationIndex)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No detailed info available
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Write Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Write Contract Functions</CardTitle>
          <CardDescription>
            Deploy, create groups, join, and deposit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />

          {/* Deploy Contract */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-lg">
                Deploy Ronda Protocol Contract
              </h3>
              <p className="mb-4 text-muted-foreground text-sm">
                Configure deployment parameters, then deploy a new contract
                instance.
              </p>

              {/* Deployment Parameters Form */}
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scope-seed">Scope Seed</Label>
                  <Input
                    id="scope-seed"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        scopeSeed: e.target.value,
                      })
                    }
                    type="text"
                    value={deploymentParams.scopeSeed || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-verification-type">
                    Verification Type (0-2)
                  </Label>
                  <Input
                    id="deploy-verification-type"
                    max="2"
                    min="0"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        verificationType: Number(
                          e.target.value
                        ) as VerificationType,
                      })
                    }
                    type="number"
                    value={deploymentParams.verificationType?.toString() || "0"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-min-age">Min Age</Label>
                  <Input
                    id="deploy-min-age"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        minAge: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={deploymentParams.minAge?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-older-than">
                    Verification: Older Than
                  </Label>
                  <Input
                    id="verification-older-than"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        verificationConfig: {
                          olderThan: BigInt(e.target.value || "0"),
                          forbiddenCountries:
                            deploymentParams.verificationConfig
                              ?.forbiddenCountries || [],
                          ofacEnabled:
                            deploymentParams.verificationConfig?.ofacEnabled ??
                            false,
                        },
                      })
                    }
                    type="number"
                    value={
                      deploymentParams.verificationConfig?.olderThan?.toString() ||
                      ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forbidden-countries">
                    Forbidden Countries (comma-separated)
                  </Label>
                  <Input
                    id="forbidden-countries"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        verificationConfig: {
                          olderThan:
                            deploymentParams.verificationConfig?.olderThan ||
                            BigInt(0),
                          forbiddenCountries: e.target.value
                            ? e.target.value.split(",").map((c) => c.trim())
                            : [],
                          ofacEnabled:
                            deploymentParams.verificationConfig?.ofacEnabled ??
                            false,
                        },
                      })
                    }
                    placeholder="US,CA"
                    type="text"
                    value={
                      deploymentParams.verificationConfig?.forbiddenCountries?.join(
                        ","
                      ) || ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ofac-enabled">OFAC Enabled</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      checked={deploymentParams.verificationConfig?.ofacEnabled}
                      className="rounded"
                      id="ofac-enabled"
                      onChange={(e) =>
                        setDeploymentParams({
                          ...deploymentParams,
                          verificationConfig: {
                            olderThan:
                              deploymentParams.verificationConfig?.olderThan ||
                              BigInt(0),
                            forbiddenCountries:
                              deploymentParams.verificationConfig
                                ?.forbiddenCountries || [],
                            ofacEnabled: e.target.checked,
                          },
                        })
                      }
                      type="checkbox"
                    />
                    <Label className="cursor-pointer" htmlFor="ofac-enabled">
                      {deploymentParams.verificationConfig?.ofacEnabled
                        ? "Yes"
                        : "No"}
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-allowed-nationalities">
                    Allowed Nationalities (comma-separated)
                  </Label>
                  <Input
                    id="deploy-allowed-nationalities"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        allowedNationalities: e.target.value
                          ? e.target.value.split(",").map((c) => c.trim())
                          : [],
                      })
                    }
                    placeholder="US,CA,MX"
                    type="text"
                    value={
                      deploymentParams.allowedNationalities?.join(",") || ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-required-gender">
                    Required Gender
                  </Label>
                  <Input
                    id="deploy-required-gender"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        requiredGender: e.target.value,
                      })
                    }
                    placeholder="male, female, or empty"
                    type="text"
                    value={deploymentParams.requiredGender || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-deposit-frequency">
                    Deposit Frequency (days)
                  </Label>
                  <Input
                    id="deploy-deposit-frequency"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        depositFrequency: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={deploymentParams.depositFrequency?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-borrow-frequency">
                    Borrow Frequency (days)
                  </Label>
                  <Input
                    id="deploy-borrow-frequency"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        borrowFrequency: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={deploymentParams.borrowFrequency?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-recurring-amount">
                    Recurring Amount (wei)
                  </Label>
                  <Input
                    id="deploy-recurring-amount"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        recurringAmount: BigInt(e.target.value || "0"),
                      })
                    }
                    type="text"
                    value={deploymentParams.recurringAmount?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deploy-operation-counter">
                    Operation Counter
                  </Label>
                  <Input
                    id="deploy-operation-counter"
                    onChange={(e) =>
                      setDeploymentParams({
                        ...deploymentParams,
                        operationCounter: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={deploymentParams.operationCounter?.toString() || ""}
                  />
                </div>
              </div>

              {/* Display Deployment Parameters */}
              <div className="mb-4 rounded-md border bg-muted p-4">
                <Label className="mb-2 block font-semibold">
                  Deployment Parameters (will be logged):
                </Label>
                <pre className="max-h-64 overflow-auto rounded border bg-background p-3 font-mono text-black text-xs">
                  {JSON.stringify(
                    {
                      scopeSeed: deploymentParams.scopeSeed,
                      verificationConfig: {
                        olderThan:
                          deploymentParams.verificationConfig?.olderThan?.toString(),
                        forbiddenCountries:
                          deploymentParams.verificationConfig
                            ?.forbiddenCountries,
                        ofacEnabled:
                          deploymentParams.verificationConfig?.ofacEnabled,
                      },
                      creator: deploymentParams.creator,
                      depositFrequency:
                        deploymentParams.depositFrequency?.toString(),
                      borrowFrequency:
                        deploymentParams.borrowFrequency?.toString(),
                      recurringAmount:
                        deploymentParams.recurringAmount?.toString(),
                      operationCounter:
                        deploymentParams.operationCounter?.toString(),
                      verificationType: deploymentParams.verificationType,
                      minAge: deploymentParams.minAge?.toString(),
                      allowedNationalities:
                        deploymentParams.allowedNationalities,
                      requiredGender: deploymentParams.requiredGender,
                      usersToInvite: deploymentParams.usersToInvite?.map((a) =>
                        String(a)
                      ),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <Button
                disabled={isDeploying || !isConnected || !address}
                onClick={() => {
                  if (!address) {
                    return;
                  }
                  const params: DeployRondaProtocolParams = {
                    name: "test-name",
                    factoryAddress,
                    scopeSeed: deploymentParams.scopeSeed || "ronda-test",
                    verificationConfig: deploymentParams.verificationConfig || {
                      olderThan: BigInt(18),
                      forbiddenCountries: [],
                      ofacEnabled: false,
                    },
                    creator: address,
                    depositFrequency:
                      deploymentParams.depositFrequency || BigInt(7),
                    borrowFrequency:
                      deploymentParams.borrowFrequency || BigInt(7),
                    recurringAmount:
                      deploymentParams.recurringAmount || BigInt(1000000),
                    operationCounter:
                      deploymentParams.operationCounter || BigInt(4),
                    verificationType:
                      deploymentParams.verificationType ||
                      (0 as VerificationType),
                    minAge: deploymentParams.minAge || BigInt(18),
                    allowedNationalities:
                      deploymentParams.allowedNationalities || [],
                    requiredGender: deploymentParams.requiredGender || "",
                    usersToInvite: deploymentParams.usersToInvite || [],
                  };
                  console.log("Deploying with parameters:", params);
                  deploy(params);
                }}
              >
                {isDeploying ? "Deploying..." : "Deploy Contract"}
              </Button>
              {deployHash && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-muted-foreground">Hash: {deployHash}</p>
                  {isDeployConfirmed && (
                    <p className="text-green-600">✓ Deployment confirmed!</p>
                  )}
                </div>
              )}
              {deployError && (
                <p className="mt-2 text-destructive text-sm">
                  Error: {deployError.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Create Group */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-lg">Create Group</h3>
              <p className="mb-4 text-muted-foreground text-sm">
                Requires a deployed contract address. Set the contract address
                above first.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deposit-frequency">
                    Deposit Frequency (days)
                  </Label>
                  <Input
                    id="deposit-frequency"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depositFrequency: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={formData.depositFrequency?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrow-frequency">
                    Borrow Frequency (days)
                  </Label>
                  <Input
                    id="borrow-frequency"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        borrowFrequency: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={formData.borrowFrequency?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurring-amount">
                    Recurring Amount (wei)
                  </Label>
                  <Input
                    id="recurring-amount"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurringAmount: BigInt(e.target.value || "0"),
                      })
                    }
                    type="text"
                    value={formData.recurringAmount?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operation-counter">Operation Counter</Label>
                  <Input
                    id="operation-counter"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        operationCounter: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={formData.operationCounter?.toString() || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-type">
                    Verification Type (0-2)
                  </Label>
                  <Input
                    id="verification-type"
                    max="2"
                    min="0"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationType: Number(
                          e.target.value
                        ) as VerificationType,
                      })
                    }
                    type="number"
                    value={formData.verificationType?.toString() || "0"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-age">Min Age</Label>
                  <Input
                    id="min-age"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minAge: BigInt(e.target.value || "0"),
                      })
                    }
                    type="number"
                    value={formData.minAge?.toString() || ""}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  disabled={
                    isCreating ||
                    !isConnected ||
                    !effectiveContractAddress ||
                    !formData.creator
                  }
                  onClick={handleCreateGroup}
                >
                  {isCreating ? "Creating..." : "Create Group"}
                </Button>
                {createHash && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-muted-foreground">Hash: {createHash}</p>
                    {isCreateConfirmed && (
                      <p className="text-green-600">✓ Transaction confirmed!</p>
                    )}
                  </div>
                )}
                {createError && (
                  <p className="mt-2 text-destructive text-sm">
                    Error: {createError.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Join Group */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Join Group</h3>
              <p className="text-muted-foreground text-sm">
                Uses the contract address set above.
              </p>
              <Button
                disabled={
                  isJoining || !effectiveContractAddress || !isConnected
                }
                onClick={handleJoinGroup}
              >
                {isJoining ? "Joining..." : "Join Group"}
              </Button>
              {joinHash && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-muted-foreground">Hash: {joinHash}</p>
                  {isJoinConfirmed && (
                    <p className="text-green-600">✓ Transaction confirmed!</p>
                  )}
                </div>
              )}
              {joinError && (
                <p className="mt-2 text-destructive text-sm">
                  Error: {joinError.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Deposit */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Deposit</h3>
              <p className="text-muted-foreground text-sm">
                Uses the contract address set above.
              </p>
              <Button
                disabled={
                  isDepositing || !effectiveContractAddress || !isConnected
                }
                onClick={handleDeposit}
              >
                {isDepositing ? "Depositing..." : "Deposit"}
              </Button>
              {depositHash && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-muted-foreground">Hash: {depositHash}</p>
                  {isDepositConfirmed && (
                    <p className="text-green-600">✓ Transaction confirmed!</p>
                  )}
                </div>
              )}
              {depositError && (
                <p className="mt-2 text-destructive text-sm">
                  Error: {depositError.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {isConnected && address && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm">{address}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
