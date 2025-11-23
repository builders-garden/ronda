import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { groups, participants } from "@/lib/database/db.schema";

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
    const normalizedAddress = address;

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
        },
        { status: 200 }
      );
    }

    // Return the list with just the selected participant's address
    return NextResponse.json(
      {
        success: true,
        addresses: eligibleParticipants.map((p) => p.userAddress),
        totalEligible: eligibleParticipants.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing mock payout:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
