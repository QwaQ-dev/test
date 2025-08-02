"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { useAuthModal } from "../../auth/AuthModal"

export function WalletConnection() {
  const { isOpen, openModal, closeModal } = useAuthModal()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to VANA</CardTitle>
          <CardDescription>Connect your wallet to get started with voice data contribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">What you'll do:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Connect your crypto wallet</li>
              <li>• Complete a quick metadata survey</li>
              <li>• Upload voice recordings to earn rewards</li>
              <li>• Track your contributions and badges</li>
            </ul>
          </div>
          <Button onClick={openModal} className="w-full" size="lg">
            Connect Wallet to Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
