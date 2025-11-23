import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/database";
import { groups, participants } from "@/lib/database/db.schema";
import { getServerSession } from "@/utils/better-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Get all participants for this group
    const participantRecords = await db.query.participants.findMany({
      where: eq(participants.groupId, groupId),
    });

    return NextResponse.json(
      { participants: participantRecords },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

const createParticipantSchema = z.object({
  userAddress: z.string().min(1),
  accepted: z.boolean().optional(),
  paid: z.boolean().optional(),
  contributed: z.boolean().optional(),
});

const updateParticipantSchema = z.object({
  participantId: z.string().min(1),
  accepted: z.boolean().optional(),
  paid: z.boolean().optional(),
  contributed: z.boolean().optional(),
  acceptedAt: z.string().optional(),
  paidAt: z.string().optional(),
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
    const parsed = createParticipantSchema.safeParse(body);
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

    // Check if participant already exists
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participants.groupId, groupId),
        eq(participants.userAddress, parsed.data.userAddress)
      ),
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Participant already exists" },
        { status: 409 }
      );
    }

    const [newParticipant] = await db
      .insert(participants)
      .values({
        groupId,
        userAddress: parsed.data.userAddress,
        accepted: parsed.data.accepted ?? false,
        paid: parsed.data.paid ?? false,
        contributed: parsed.data.contributed ?? false,
      })
      .returning();

    return NextResponse.json({ participant: newParticipant }, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const parsed = updateParticipantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const participantId = parsed.data.participantId;

    // Check if group exists and user is the creator
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the creator can update participants" },
        { status: 403 }
      );
    }

    // Check if participant exists
    const existingParticipant = await db.query.participants.findFirst({
      where: eq(participants.id, participantId),
    });

    if (!existingParticipant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (existingParticipant.groupId !== groupId) {
      return NextResponse.json(
        { error: "Participant does not belong to this group" },
        { status: 400 }
      );
    }

    const updateData: {
      accepted?: boolean;
      paid?: boolean;
      contributed?: boolean;
      acceptedAt?: Date | null;
      paidAt?: Date | null;
    } = {};

    if (parsed.data.accepted !== undefined) {
      updateData.accepted = parsed.data.accepted;
      updateData.acceptedAt = parsed.data.accepted ? new Date() : null;
    }

    if (parsed.data.paid !== undefined) {
      updateData.paid = parsed.data.paid;
      updateData.paidAt = parsed.data.paid ? new Date() : null;
    }

    if (parsed.data.contributed !== undefined) {
      updateData.contributed = parsed.data.contributed;
    }

    if (parsed.data.acceptedAt !== undefined) {
      updateData.acceptedAt = parsed.data.acceptedAt
        ? new Date(parsed.data.acceptedAt)
        : null;
    }

    if (parsed.data.paidAt !== undefined) {
      updateData.paidAt = parsed.data.paidAt
        ? new Date(parsed.data.paidAt)
        : null;
    }

    const [updatedParticipant] = await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId))
      .returning();

    return NextResponse.json(
      { participant: updatedParticipant },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
