import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/database";
import { groups } from "@/lib/database/db.schema";
import { getServerSession } from "@/utils/better-auth";

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  groupAddress: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);
    console.log("error", parsed.error);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const [newGroup] = await db
      .insert(groups)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        groupAddress: parsed.data.groupAddress,
        creatorId: session.user.id,
      })
      .returning();

    return NextResponse.json({ group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
