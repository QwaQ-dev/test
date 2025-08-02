import { NextResponse } from "next/server"

// In-memory storage for demo - use a database in production
const userMetadata = new Map()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, metadata, location, timestamp } = body

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // Store user metadata
    userMetadata.set(walletAddress, {
      metadata,
      location,
      timestamp,
      createdAt: new Date().toISOString(),
    })

    console.log("User metadata saved:", { walletAddress, metadata, location })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving user metadata:", error)
    return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
    }

    const userData = userMetadata.get(address)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
