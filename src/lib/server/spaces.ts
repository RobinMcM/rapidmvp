import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { readRequiredEnv } from './runtime-env'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxUploadBytes = 5 * 1024 * 1024

type SpacesConfig = {
  region: string
  endpoint: string
  bucket: string
  publicBaseUrl: string
  client: S3Client
}

let cachedConfig: SpacesConfig | null = null

function getSpacesConfig() {
  if (cachedConfig) {
    return cachedConfig
  }

  const region = readRequiredEnv('DO_SPACES_REGION')
  const endpoint = readRequiredEnv('DO_SPACES_ENDPOINT')
  const bucket = readRequiredEnv('DO_SPACES_BUCKET')
  const publicBaseUrl = readRequiredEnv('DO_SPACES_PUBLIC_BASE_URL')
  const accessKeyId = readRequiredEnv('DO_SPACES_ACCESS_KEY_ID')
  const secretAccessKey = readRequiredEnv('DO_SPACES_SECRET_ACCESS_KEY')

  cachedConfig = {
    region,
    endpoint,
    bucket,
    publicBaseUrl,
    client: new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  }

  return cachedConfig
}

function extensionForMimeType(contentType: string) {
  if (contentType === 'image/jpeg') {
    return 'jpg'
  }

  if (contentType === 'image/png') {
    return 'png'
  }

  if (contentType === 'image/webp') {
    return 'webp'
  }

  throw new Error('Unsupported content type')
}

const DOCUMENT_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  markdown: 'text/markdown',
  terraform: 'text/plain',
  bicep: 'text/plain',
  arm: 'application/json',
  csv: 'text/csv',
  screenshot: 'image/png',
  repository_zip: 'application/zip',
}

const DOCUMENT_MAX_BYTES: Record<string, number> = {
  screenshot: 5 * 1024 * 1024,
  repository_zip: 100 * 1024 * 1024, // 100 MB — GitHub repo ZIPs can be large
}
const DEFAULT_DOC_MAX_BYTES = 20 * 1024 * 1024

export async function generateDocumentUploadUrl(input: {
  repositoryId: string
  documentId: string
  fileName: string
  fileType: string
}) {
  const config = getSpacesConfig()

  const contentType = DOCUMENT_MIME_MAP[input.fileType]
  if (!contentType) {
    throw new Error(`Unsupported document type: ${input.fileType}`)
  }

  const maxBytes = DOCUMENT_MAX_BYTES[input.fileType] ?? DEFAULT_DOC_MAX_BYTES
  const spacesKey = `documents/${input.repositoryId}/${input.documentId}/${input.fileName}`

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: spacesKey,
    ContentType: contentType,
  })

  const presignedUrl = await getSignedUrl(config.client, command, { expiresIn: 300 })

  return { presignedUrl, spacesKey, expiresIn: 300, maxBytes }
}

export async function getDocumentBuffer(spacesKey: string): Promise<Buffer> {
  const config = getSpacesConfig()
  const command = new GetObjectCommand({ Bucket: config.bucket, Key: spacesKey })
  const response = await config.client.send(command)

  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function createAvatarUploadUrl(input: {
  siteKey: string
  userId: string
  contentType: string
}) {
  const config = getSpacesConfig()

  if (!allowedMimeTypes.has(input.contentType)) {
    throw new Error('Unsupported image type')
  }

  const extension = extensionForMimeType(input.contentType)
  const objectKey = `${input.siteKey}/profiles/${input.userId}/avatar/${Date.now()}.${extension}`

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: input.contentType,
  })

  const uploadUrl = await getSignedUrl(config.client, command, {
    expiresIn: 300,
  })

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${config.publicBaseUrl}/${objectKey}`,
    expiresIn: 300,
    maxUploadBytes,
  }
}
