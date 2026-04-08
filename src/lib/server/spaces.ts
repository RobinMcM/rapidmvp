import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
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
