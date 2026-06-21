'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Phase = 'idle' | 'creating' | 'uploading' | 'confirming' | 'redirecting' | 'error'

export default function RepositoryUploadFlow() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.zip')) {
      setMessage('Please select a .zip file exported from your repository host.')
      return
    }

    try {
      // 1. Create a repository package
      setPhase('creating')
      setMessage('Creating repository…')
      const createRes = await fetch('/api/v1/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name }),
      })
      if (!createRes.ok) throw new Error('Failed to create repository')
      const { repositoryId } = (await createRes.json()) as { repositoryId: string }

      // 2. Get a presigned upload URL
      setPhase('uploading')
      setMessage('Requesting upload URL…')
      const urlRes = await fetch('/api/v1/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId, fileName: file.name, fileType: 'repository_zip' }),
      })
      if (!urlRes.ok) {
        const body = (await urlRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Failed to get upload URL')
      }
      const { documentId, presignedUrl } = (await urlRes.json()) as { documentId: string; presignedUrl: string }

      // 3. PUT ZIP directly to Spaces
      setMessage(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)…`)
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/zip' },
      })
      if (!putRes.ok) throw new Error('Upload to storage failed')

      // 4. Confirm the upload
      setPhase('confirming')
      setMessage('Confirming upload…')
      const confirmRes = await fetch('/api/v1/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      // 5. Open the repository
      setPhase('redirecting')
      setMessage('Opening repository…')
      router.push(`/repositories/${repositoryId}`)
    } catch (err) {
      setPhase('error')
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isWorking = ['creating', 'uploading', 'confirming', 'redirecting'].includes(phase)

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-dashed border-slate-700 p-8 flex flex-col items-center gap-4 text-center">
      <div className="text-slate-300 font-semibold">Upload Repository ZIP</div>
      <p className="text-slate-500 text-sm max-w-md">
        Export your repository as a ZIP and upload it here. RapidMVP inspects the contents and turns it
        into a cloud installation plan.
      </p>
      <p className="text-slate-600 text-xs font-mono">GitHub → Code → Download ZIP · Accepts .zip up to 100 MB</p>

      {message && (
        <p className={`text-xs font-mono ${phase === 'error' ? 'text-red-400' : 'text-azure-300'}`}>{message}</p>
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
        {isWorking ? 'Working…' : 'Upload repository ZIP'}
      </label>
    </div>
  )
}
