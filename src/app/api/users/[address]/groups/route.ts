import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { groups, participants } from "@/lib/database/db.schema";
import { getUserFromFid } from "@/lib/database/queries/user.query";
import { fetchUserByAddress } from "@/lib/neynar";
import { getServerSession } from "@/utils/better-auth";

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
    const normalizedAddress = address.toLowerCase();

    // Get groups where the user is a participant
    const participantRecords = await db.query.participants.findMany({
      where: eq(participants.userAddress, normalizedAddress),
      with: {
        group: true,
      },
    });

    const groupsAsParticipant = participantRecords.map((p) => p.group);

    // Try to get groups where the user is the creator
    // First, try to find the user in the database via their address
    let groupsAsCreator: (typeof groups.$inferSelect)[] = [];

    try {
      const session = await getServerSession();
      const viewerFid = session?.user?.email?.split("@")[0]
        ? Number.parseInt(session?.user?.email?.split("@")[0], 10)
        : undefined;

      const neynarUser = await fetchUserByAddress(address, viewerFid);
      if (neynarUser?.fid) {
        const dbUser = await getUserFromFid(neynarUser.fid);
        if (dbUser) {
          const creatorGroups = await db.query.groups.findMany({
            where: eq(groups.creatorId, dbUser.id),
          });
          groupsAsCreator = creatorGroups;
        }
      }
    } catch (error) {
      // If we can't fetch user info, just continue with participant groups
      console.warn("Could not fetch user info for creator groups:", error);
    }

    // Combine and deduplicate groups
    const allGroupsMap = new Map<string, typeof groups.$inferSelect>();

    // Add participant groups
    for (const group of groupsAsParticipant) {
      if (group) {
        allGroupsMap.set(group.id, group);
      }
    }

    // Add creator groups
    for (const group of groupsAsCreator) {
      allGroupsMap.set(group.id, group);
    }

    const allGroups = Array.from(allGroupsMap.values());

    return NextResponse.json({ groups: allGroups }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
