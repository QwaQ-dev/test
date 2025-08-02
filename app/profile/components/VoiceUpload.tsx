"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Play, Pause, Upload, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useAccount } from "wagmi"

interface VoiceRecording {
  id: string
  blob: Blob
  duration: number
  timestamp: Date
}

export function VoiceUpload() {
  const { address } = useAccount()
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<VoiceRecording[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const recording: VoiceRecording = {
          id: Date.now().toString(),
          blob: audioBlob,
          duration: recordingTime,
          timestamp: new Date(),
        }
        setRecordings((prev) => [...prev, recording])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Could not access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = (recording: VoiceRecording) => {
    if (currentlyPlaying === recording.id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
      return
    }

    const audioUrl = URL.createObjectURL(recording.blob)
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.onended = () => {
      setCurrentlyPlaying(null)
      URL.revokeObjectURL(audioUrl)
    }

    audio.play()
    setCurrentlyPlaying(recording.id)
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id))
    if (currentlyPlaying === id) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
    }
  }

  const uploadRecordings = async () => {
    if (recordings.length === 0) {
      toast.error("No recordings to upload")
      return
    }

    setIsUploading(true)

    try {
      for (const recording of recordings) {
        const formData = new FormData()
        formData.append("audio", recording.blob, `voice_${recording.id}.wav`)
        formData.append("walletAddress", address || "")
        formData.append("duration", recording.duration.toString())
        formData.append("timestamp", recording.timestamp.toISOString())

        const response = await fetch("/api/voice/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload recording ${recording.id}`)
        }
      }

      toast.success(`Successfully uploaded ${recordings.length} recording(s)`)
      setRecordings([])
    } catch (error) {
      console.error("Error uploading recordings:", error)
      toast.error("Failed to upload recordings")
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Your space for voice data upload, @{address?.slice(0, 6)}...{address?.slice(-4)}
          </CardTitle>
          <CardDescription className="flex items-center space-x-2">
            <span>Connected to VANA Network</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Record Voice Data</CardTitle>
          <CardDescription>Record clear voice samples to contribute to the VANA voice dataset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="w-20 h-20 rounded-full"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              {isRecording && <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-pulse" />}
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                <div className="text-sm text-gray-500">Recording...</div>
              </div>
            )}
          </div>

          {recordings.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Recorded Samples ({recordings.length})</h3>
              <div className="space-y-2">
                {recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Button size="sm" variant="ghost" onClick={() => playRecording(recording)}>
                        {currentlyPlaying === recording.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div>
                        <div className="text-sm font-medium">Recording {recording.id}</div>
                        <div className="text-xs text-gray-500">
                          {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteRecording(recording.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={uploadRecordings} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {recordings.length} Recording(s)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Recording Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Record in a quiet environment</li>
            <li>• Each recording should be 10-60 seconds long</li>
            <li>• You can record multiple samples before uploading</li>
            <li>• Your voice data will be encrypted and processed securely</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
