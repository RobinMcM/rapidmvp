'use client'

import { useRef, useState } from 'react'

type Props = {
  blueprintId: string
  onAssessmentCreated: (assessmentId: string) => void
}

type UploadPhase = 'idle' | 'uploading' | 'confirming' | 'creating' | 'done' | 'error'

export default function RepositoryUploadPanel({ blueprintId, onAssessmentCreated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.zip')) {
      setMessage('Please select a .zip file exported from GitHub.')
      return
    }

    setPhase('uploading')
    setMessage('Requesting upload URL…')

    try {
      // 1. Get presigned URL via existing document upload system
      const urlRes = await fetch('/api/v1/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId, fileName: file.name, fileType: 'repository_zip' }),
      })
      if (!urlRes.ok) {
        const errBody = await urlRes.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error ?? 'Failed to get upload URL')
      }
      const { documentId, presignedUrl } = (await urlRes.json()) as { documentId: string; presignedUrl: string }

      // 2. PUT ZIP directly to DigitalOcean Spaces
      setMessage('Uploading repository ZIP…')
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/zip' },
      })
      if (!putRes.ok) throw new Error('Upload to storage failed')

      // 3. Confirm the DocumentUpload
      setPhase('confirming')
      setMessage('Confirming upload…')
      const confirmRes = await fetch('/api/v1/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      // 4. Create RepositoryAssessment linked to this DocumentUpload
      setPhase('creating')
      setMessage('Creating assessment record…')
      const createRes = await fetch('/api/v1/repository-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId,
          documentUploadId: documentId,
          repositoryName: file.name,
        }),
      })
      if (!createRes.ok) {
        const errBody = await createRes.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error ?? 'Failed to create assessment')
      }
      const newAssessment = (await createRes.json()) as { id: string }

      setPhase('done')
      setMessage('ZIP uploaded. Click "Inspect Repository" to run the assessment.')
      onAssessmentCreated(newAssessment.id)
    } catch (err) {
      setPhase('error')
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isWorking = ['uploading', 'confirming', 'creating'].includes(phase)

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-dashed border-slate-700 p-8 flex flex-col items-center gap-4 text-center">
      <div className="text-slate-300 font-semibold">Upload Repository ZIP</div>
      <p className="text-slate-500 text-sm max-w-md">
        Export your GitHub repository as a ZIP and upload it here. RapidMVP will inspect the files
        and generate an Azure installation readiness assessment.
      </p>
      <p className="text-slate-600 text-xs font-mono">GitHub → Code → Download ZIP</p>

      {message && (
        <p className={`text-xs font-mono ${phase === 'error' ? 'text-red-400' : 'text-azure-300'}`}>
          {message}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        disabled={isWorking}
        className="hidden"
        id="repo-zip-input"
      />
      <label
        htmlFor="repo-zip-input"
        className={`px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold transition-colors ${
          isWorking ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer hover:bg-azure-600'
        }`}
      >
        {isWorking ? 'Uploading…' : 'Choose ZIP File'}
      </label>
    </div>
  )
}
