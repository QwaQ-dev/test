import { NextResponse } from "next/server"

// Mock user stats - replace with database queries
const userStats = new Map()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    // Mock stats - in production, calculate from actual data
    const stats = userStats.get(address) || {
      totalMinutesUploaded: 0,
      totalContributions: 0,
      rewardsEarned: 0,
      badges: [],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
