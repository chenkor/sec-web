import { NextResponse } from "next/server";
import { fetchSecLiveData } from "@/lib/github";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await fetchSecLiveData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
