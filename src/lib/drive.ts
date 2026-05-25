import { google } from 'googleapis'
import { Readable } from 'stream'

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

export interface UploadResult {
  fileId: string
  webViewLink: string
}

export async function uploadFileToDrive(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<UploadResult> {
  const drive = getDriveClient()
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id,webViewLink',
  })

  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
  }
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient()
  await drive.files.delete({ fileId })
}

export function getDriveThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}
