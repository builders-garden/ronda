import { NextResponse } from "next/server";
import type { User } from "@/lib/database/db.schema";
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

    // Get the current session to use as viewerFid if available
    const session = await getServerSession();
    const viewerFid = session?.user?.email?.split("@")[0]
      ? Number.parseInt(session?.user?.email?.split("@")[0], 10)
      : undefined;

    // Fetch user from Neynar by address
    const neynarUser = await fetchUserByAddress(address, viewerFid);

    if (!neynarUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to get the user from the database if they exist
    let dbUser: User | null = null;
    if (neynarUser.fid) {
      dbUser = await getUserFromFid(neynarUser.fid);
    }

    return NextResponse.json(
      {
        neynarUser,
        dbUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user by address:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
