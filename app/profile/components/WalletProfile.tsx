"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink, MapPin, User, Calendar, Briefcase } from "lucide-react"
import { useAccount, useDisconnect } from "wagmi"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface UserMetadata {
  region: string
  language: string
  dateOfBirth: string
  occupation: string
  interests: string
  experience: string
}

interface UserStats {
  totalMinutesUploaded: number
  totalContributions: number
  rewardsEarned: number
  badges: string[]
}

export function WalletProfile() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [metadata, setMetadata] = useState<UserMetadata | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchUserData()
    }
  }, [address])

  const fetchUserData = async () => {
    try {
      const [metadataResponse, statsResponse] = await Promise.all([
        fetch(`/api/user/metadata?address=${address}`),
        fetch(`/api/user/stats?address=${address}`),
      ])

      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json()
        setMetadata(metadataData.metadata)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success("Address copied to clipboard")
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">Please connect your wallet to view profile</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">Your wallet profile, @{formatAddress(address || "")}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span>Connected to VANA Network</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connection Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connection details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{address}</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Network:</span>
              <div className="font-medium">VANA Moksha Testnet</div>
            </div>
            <div>
              <span className="text-gray-500">Connected:</span>
              <div className="font-medium">{new Date().toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Last Activity:</span>
              <div className="font-medium">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your metadata provided</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Region:</span>
              <span className="font-medium">{metadata.region}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Language:</span>
              <span className="font-medium">{metadata.language}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Date of Birth:</span>
              <span className="font-medium">{new Date(metadata.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Occupation:</span>
              <span className="font-medium">{metadata.occupation}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">YOUR BADGES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div className="text-sm font-medium">{stats?.totalMinutesUploaded || 0}+ minutes uploaded</div>
            </div>
            <div className="border rounded-lg p-4 text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
            <div className="border rounded-lg p-4 text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
            <div className="border rounded-lg p-4 text-center opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2"></div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">ZONE OF EXTREME</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button variant="secondary" onClick={() => disconnect()}>
              Disconnect wallet
            </Button>
            <Button variant="secondary">Request the remove of your data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
