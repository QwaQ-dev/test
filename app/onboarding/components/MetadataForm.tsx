"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { toast } from "sonner"

interface MetadataFormData {
  region: string
  language: string
  dateOfBirth: string
  occupation: string
  interests: string
  experience: string
}

interface LocationData {
  country: string
  region: string
  city: string
}

export function MetadataForm({ onComplete }: { onComplete: () => void }) {
  const { address } = useAccount()
  const [formData, setFormData] = useState<MetadataFormData>({
    region: "",
    language: "",
    dateOfBirth: "",
    occupation: "",
    interests: "",
    experience: "",
  })
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    try {
      // Request geolocation permission
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            // Use a geolocation API to get location details
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              )
              const data = await response.json()

              const locationData = {
                country: data.countryName || "",
                region: data.principalSubdivision || "",
                city: data.city || "",
              }

              setLocation(locationData)
              setFormData((prev) => ({
                ...prev,
                region: `${locationData.city}, ${locationData.region}, ${locationData.country}`,
              }))
            } catch (error) {
              console.error("Error fetching location details:", error)
              toast.error("Could not detect location automatically")
            }
          },
          (error) => {
            console.error("Geolocation error:", error)
            toast.error("Location access denied. Please enter manually.")
          },
        )
      }
    } catch (error) {
      console.error("Location detection error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          metadata: formData,
          location,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save metadata")
      }

      toast.success("Profile completed successfully!")
      onComplete()
    } catch (error) {
      console.error("Error saving metadata:", error)
      toast.error("Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: keyof MetadataFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Help us understand your background to provide better voice data matching</CardDescription>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${step <= currentStep ? "bg-blue-600" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="region">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="region"
                      placeholder="City, Region, Country"
                      value={formData.region}
                      onChange={(e) => updateFormData("region", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {location && <p className="text-xs text-gray-500">Auto-detected from your location</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Select value={formData.language} onValueChange={(value) => updateFormData("language", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="russian">Russian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Background</h3>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select value={formData.occupation} onValueChange={(value) => updateFormData("occupation", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="healthcare">Healthcare Professional</SelectItem>
                      <SelectItem value="business">Business Professional</SelectItem>
                      <SelectItem value="creative">Creative Professional</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Areas of Interest</Label>
                  <Textarea
                    id="interests"
                    placeholder="Technology, Music, Sports, Science, etc."
                    value={formData.interests}
                    onChange={(e) => updateFormData("interests", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Voice & AI Experience</h3>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience with Voice AI</Label>
                  <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="basic">Basic (used voice assistants)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (familiar with AI)</SelectItem>
                      <SelectItem value="advanced">Advanced (work with AI/ML)</SelectItem>
                      <SelectItem value="expert">Expert (AI researcher/developer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Ready to contribute!</h4>
                  <p className="text-blue-800 text-sm">
                    Your voice data will help train AI models while keeping your privacy protected through encryption.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="ml-auto"
                  disabled={
                    (currentStep === 1 && (!formData.region || !formData.language || !formData.dateOfBirth)) ||
                    (currentStep === 2 && !formData.occupation)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !formData.experience} className="ml-auto">
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
