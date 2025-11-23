import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/database";
import { groups } from "@/lib/database/db.schema";
import { getServerSession } from "@/utils/better-auth";

const updateGroupSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  groupAddress: z.string().min(1).optional(),
});

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
    const parsed = updateGroupSchema.safeParse(body);
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
        { error: "Only the creator can update this group" },
        { status: 403 }
      );
    }

    const [updatedGroup] = await db
      .update(groups)
      .set(parsed.data)
      .where(eq(groups.id, groupId))
      .returning();

    return NextResponse.json({ group: updatedGroup }, { status: 200 });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
