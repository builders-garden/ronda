import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Address } from "viem";
import {
  createPublicClient,
  createWalletClient,
  http,
  type TransactionReceipt,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { db } from "@/lib/database";
import { groups, participants } from "@/lib/database/db.schema";
import { env } from "@/lib/env";
import { RONDA_PROTOCOL_ABI } from "@/lib/smart-contracts/config";

// Create clients for Celo chain
const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || address.trim().length === 0) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Normalize address to lowercase for comparison
    const normalizedAddress = address as Address;

    // Find the group by groupAddress
    const group = await db.query.groups.findFirst({
      where: eq(groups.groupAddress, normalizedAddress),
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get all participants who have accepted and haven't been paid yet
    const eligibleParticipants = await db.query.participants.findMany({
      where: and(
        eq(participants.groupId, group.id),
        eq(participants.accepted, true),
        eq(participants.paid, false)
      ),
    });

    if (eligibleParticipants.length === 0) {
      return NextResponse.json(
        {
          message: "No eligible participants for payout",
          addresses: [],
          txHash: null,
        },
        { status: 200 }
      );
    }

    // Get addresses for distribution
    const addressesToDistribute = eligibleParticipants.map(
      (p) => p.userAddress as Address
    );

    // Create wallet client with private key
    const account = privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: celo,
      transport: http(),
    });

    console.log(
      `Distributing funds to ${addressesToDistribute.length} participants...`
    );

    // Call distributeFunds on the contract
    let hash: `0x${string}`;
    try {
      hash = await walletClient.writeContract({
        address: normalizedAddress,
        abi: RONDA_PROTOCOL_ABI,
        functionName: "distributeFunds",
        args: [addressesToDistribute],
        chain: celo,
      });

      console.log(`Transaction hash: ${hash}`);
    } catch (contractError) {
      console.error("Error calling distributeFunds:", contractError);
      const errorMessage =
        contractError instanceof Error
          ? contractError.message
          : "Failed to call distributeFunds";

      // Parse common contract errors for better user feedback
      let userMessage = "Failed to distribute funds. Please try again.";
      if (errorMessage.includes("insufficient funds")) {
        userMessage = "Insufficient funds in the contract to distribute.";
      } else if (errorMessage.includes("user rejected")) {
        userMessage = "Transaction was rejected.";
      } else if (errorMessage.includes("gas")) {
        userMessage = "Transaction failed due to gas issues.";
      }

      return NextResponse.json(
        {
          error: userMessage,
          details: errorMessage,
        },
        { status: 400 }
      );
    }

    // Wait for transaction receipt
    let receipt: TransactionReceipt;
    try {
      receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000, // 60 second timeout
      });

      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      // Check if transaction was successful
      if (receipt.status === "reverted") {
        console.error("Transaction reverted:", receipt);
        return NextResponse.json(
          {
            error:
              "Transaction reverted on-chain. Please check contract state.",
            txHash: hash,
          },
          { status: 400 }
        );
      }
    } catch (receiptError) {
      console.error("Error waiting for transaction receipt:", receiptError);
      return NextResponse.json(
        {
          error:
            "Transaction submitted but confirmation timed out. Please check the transaction manually.",
          txHash: hash,
        },
        { status: 202 } // 202 Accepted - processing but not confirmed
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        addresses: addressesToDistribute,
        totalEligible: eligibleParticipants.length,
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing mock payout:", error);

    // Handle specific error types
    let errorMessage = "An unexpected error occurred while processing payout.";
    let statusCode = 500;

    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes("PRIVATE_KEY")) {
        errorMessage = "Server configuration error. Please contact support.";
        console.error("Private key configuration error");
      } else if (error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        statusCode = 503;
      } else if (
        error.message.includes("database") ||
        error.message.includes("query")
      ) {
        errorMessage = "Database error. Please try again later.";
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
