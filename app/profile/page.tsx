"use client"
import { WalletProfile } from "./components/WalletProfile"
import { VoiceUpload } from "./components/VoiceUpload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Wallet Profile</TabsTrigger>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <WalletProfile />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <VoiceUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
