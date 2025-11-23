import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/database";
import { groups, participants } from "@/lib/database/db.schema";
import { getServerSession } from "@/utils/better-auth";

const createParticipantItemSchema = z.object({
  userAddress: z.string().min(1),
  accepted: z.boolean().optional(),
  paid: z.boolean().optional(),
  contributed: z.boolean().optional(),
});

const batchCreateParticipantsSchema = z.object({
  participants: z.array(createParticipantItemSchema).min(1),
  adminAddress: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const body = await request.json();
    const parsed = batchCreateParticipantsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    // Check if group exists and user is the creator
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can add participants" },
        { status: 403 }
      );
    }

    // Get all addresses from the request
    const addresses = parsed.data.participants.map((p) => p.userAddress);
    const adminAddress = parsed.data.adminAddress;

    // Check for existing participants
    const existingParticipants = await db.query.participants.findMany({
      where: and(
        eq(participants.groupId, groupId),
        inArray(participants.userAddress, addresses)
      ),
    });

    const existingAddresses = new Set(
      existingParticipants.map((p) => p.userAddress)
    );

    // Filter out participants that already exist
    const newParticipants = parsed.data.participants.filter(
      (p) => !existingAddresses.has(p.userAddress)
    );

    if (newParticipants.length === 0) {
      return NextResponse.json(
        { error: "All participants already exist" },
        { status: 409 }
      );
    }

    // Insert all new participants
    const insertedParticipants = await db
      .insert(participants)
      .values(
        newParticipants.map((p) => ({
          groupId,
          userAddress: p.userAddress,
          accepted: adminAddress === p.userAddress,
          acceptedAt: adminAddress === p.userAddress ? new Date() : null,
        }))
      )
      .returning();

    return NextResponse.json(
      {
        participants: insertedParticipants,
        created: insertedParticipants.length,
        skipped: existingParticipants.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error batch creating participants:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
