"use client"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      // Check if user has completed onboarding
      router.push("/profile")
    } else {
      router.push("/onboarding")
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">VANA Voice Data Platform</h1>
        <p className="text-gray-600 mb-8">Redirecting...</p>
      </div>
    </div>
  )
}
