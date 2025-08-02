"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { MetadataForm } from "./components/MetadataForm"
import { WalletConnection } from "./components/WalletConnection"

export default function OnboardingPage() {
  const { isConnected } = useAccount()
  const [hasCompletedMetadata, setHasCompletedMetadata] = useState(false)

  if (!isConnected) {
    return <WalletConnection />
  }

  if (!hasCompletedMetadata) {
    return <MetadataForm onComplete={() => setHasCompletedMetadata(true)} />
  }

  // Redirect to main app after onboarding
  window.location.href = "/profile"
  return null
}
