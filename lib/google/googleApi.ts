import { google } from "googleapis"

export async function getUserInfo(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()

  return {
    id: data.id,
    name: data.name || "",
    email: data.email || "",
    locale: data.locale,
    picture: data.picture,
    verifiedEmail: data.verified_email,
  }
}

export async function getDriveInfo(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const drive = google.drive({ version: "v3", auth: oauth2Client })
  const { data } = await drive.about.get({
    fields: "storageQuota",
  })

  const quota = data.storageQuota
  if (!quota) {
    throw new Error("Unable to fetch drive quota information")
  }

  const used = Number.parseInt(quota.usage || "0")
  const limit = Number.parseInt(quota.limit || "0")
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return {
    percentUsed,
    usedStorageBytes: formatBytes(used),
    totalStorageBytes: formatBytes(limit),
  }
}
