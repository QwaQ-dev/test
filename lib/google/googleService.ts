import type { UserInfo, DriveInfo } from "@/app/contribution/types"
import { clientSideEncrypt, formatVanaFileId } from "@/lib/crypto/utils"

export interface UploadResponse {
  vanaFileId: string
  downloadUrl: string
  encryptedData: string
}

export async function uploadUserData(
  userInfo: UserInfo,
  signature: string,
  accessToken: string,
  driveInfo?: DriveInfo,
): Promise<UploadResponse> {
  // Prepare the data to be encrypted
  const dataToEncrypt = {
    userInfo,
    driveInfo,
    timestamp: new Date().toISOString(),
    signature,
  }

  // Convert to blob for encryption
  const jsonString = JSON.stringify(dataToEncrypt, null, 2)
  const dataBlob = new Blob([jsonString], { type: "application/json" })

  // Encrypt the data
  const encryptedBlob = await clientSideEncrypt(dataBlob, signature)

  // Generate a unique file ID
  const vanaFileId = formatVanaFileId("user_data.json")

  // In a real implementation, you would upload to Google Drive here
  // For now, we'll create a mock download URL
  const downloadUrl = `https://drive.google.com/file/d/${vanaFileId}/view`

  // Convert encrypted blob to base64 for storage/transmission
  const arrayBuffer = await encryptedBlob.arrayBuffer()
  const encryptedData = Buffer.from(arrayBuffer).toString("base64")

  return {
    vanaFileId,
    downloadUrl,
    encryptedData,
  }
}
