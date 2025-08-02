"use client"

import { useState } from "react"
import { useSignMessage } from "wagmi"
import type { ContributionData, DriveInfo, UserInfo } from "../types"
import { useAddFile } from "./useAddFile"
import { useDataUpload } from "./useDataUpload"

// Mock functions - you'll need to implement these
const extractFileIdFromReceipt = (receipt: any): number => {
  return Math.floor(Math.random() * 1000) // Mock file ID
}

const encryptWithWalletPublicKey = async (signature: string, publicKey: string): Promise<string> => {
  return `encrypted_${signature}` // Mock encryption
}

const getDlpPublicKey = async (): Promise<string> => {
  return "mock-public-key"
}

// Steps aligned with ContributionSteps component (1-based indexing)
const STEPS = {
  UPLOAD_DATA: 1,
  BLOCKCHAIN_REGISTRATION: 2,
  REQUEST_TEE_PROOF: 3,
  PROCESS_PROOF: 4,
  CLAIM_REWARD: 5,
}

const SIGN_MESSAGE = "Please sign to retrieve your encryption key"

export function useContributionFlow() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [contributionData, setContributionData] = useState<ContributionData | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")

  const { signMessageAsync, isPending: isSigningMessage } = useSignMessage()
  const { uploadData, isUploading } = useDataUpload()
  const { addFile, isAdding, contractError } = useAddFile()

  const isLoading = isUploading || isAdding || isSigningMessage

  const resetFlow = () => {
    setIsSuccess(false)
    setError(null)
    setCurrentStep(0)
    setCompletedSteps([])
    setContributionData(null)
    setShareUrl("")
  }

  const handleContributeData = async (userInfo: UserInfo, driveInfo: DriveInfo, isConnected: boolean) => {
    if (!userInfo) {
      setError("Unable to access user information. Please try again.")
      return
    }

    try {
      setError(null)

      // Execute steps in sequence
      const signature = await executeSignMessageStep()
      if (!signature) return

      const uploadResult = await executeUploadDataStep(userInfo, signature, driveInfo)
      if (!uploadResult) return

      if (!isConnected) {
        setError("Wallet connection required to register on blockchain")
        return
      }

      const { fileId, txReceipt, encryptedKey } = await executeBlockchainRegistrationStep(uploadResult, signature)
      if (!fileId) return

      // Update contribution data with blockchain information
      updateContributionData({
        contributionId: uploadResult.vanaFileId,
        encryptedUrl: uploadResult.downloadUrl,
        transactionReceipt: {
          hash: txReceipt.transactionHash,
          blockNumber: txReceipt.blockNumber ? Number(txReceipt.blockNumber) : undefined,
        },
        fileId,
      })

      setIsSuccess(true)
    } catch (error) {
      console.error("Error contributing data:", error)
      setError(error instanceof Error ? error.message : "Failed to process your contribution. Please try again.")
    }
  }

  // Step 0: Sign message (pre-step before the visible flow begins)
  const executeSignMessageStep = async (): Promise<string | undefined> => {
    try {
      const signature = await signMessageAsync({ message: SIGN_MESSAGE })
      return signature
    } catch (signError) {
      console.error("Error signing message:", signError)
      setError("Failed to sign the message. Please try again.")
      return undefined
    }
  }

  // Step 1: Upload data to Google Drive
  const executeUploadDataStep = async (userInfo: UserInfo, signature: string, driveInfo: DriveInfo) => {
    setCurrentStep(STEPS.UPLOAD_DATA)
    const uploadResult = await uploadData(userInfo, signature, driveInfo)
    if (!uploadResult) {
      setError("Failed to upload data to Google Drive")
      return null
    }
    setShareUrl(uploadResult.downloadUrl)
    markStepComplete(STEPS.UPLOAD_DATA)
    return uploadResult
  }

  // Step 2: Register on blockchain
  const executeBlockchainRegistrationStep = async (uploadResult: any, signature: string) => {
    setCurrentStep(STEPS.BLOCKCHAIN_REGISTRATION)

    // Get DLP public key and encrypt the signature
    const publicKey = await getDlpPublicKey()
    const encryptedKey = await encryptWithWalletPublicKey(signature, publicKey)

    // Add the file to blockchain
    const txReceipt = await addFile(uploadResult.downloadUrl, encryptedKey)
    if (!txReceipt) {
      if (contractError) {
        setError(`Contract error: ${contractError}`)
      } else {
        setError("Failed to add file to blockchain")
      }
      return { fileId: null }
    }

    // Extract file ID from transaction receipt
    const fileId = extractFileIdFromReceipt(txReceipt)
    markStepComplete(STEPS.BLOCKCHAIN_REGISTRATION)
    return { fileId, txReceipt, encryptedKey }
  }

  // Helper functions
  const markStepComplete = (step: number) => {
    setCompletedSteps((prev) => [...prev, step])
  }

  const updateContributionData = (newData: Partial<ContributionData>) => {
    setContributionData((prev) => {
      if (!prev) return newData as ContributionData
      return { ...prev, ...newData }
    })
  }

  return {
    isSuccess,
    error,
    currentStep,
    completedSteps,
    contributionData,
    shareUrl,
    isLoading,
    isSigningMessage,
    handleContributeData,
    resetFlow,
  }
}
