import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { searchUserByUsername } from "@/lib/neynar";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const users = await searchUserByUsername(query);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
