'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DocumentListCard from './DocumentListCard'

const FILE_TYPE_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/markdown': 'markdown',
  'text/plain': 'terraform', // .tf and .bicep are text/plain — rely on extension
  'application/json': 'arm',
  'text/csv': 'csv',
  'image/png': 'screenshot',
}

const EXT_TYPE_MAP: Record<string, string> = {
  pdf: 'pdf',
  docx: 'docx',
  md: 'markdown',
  markdown: 'markdown',
  tf: 'terraform',
  bicep: 'bicep',
  json: 'arm',
  csv: 'csv',
  png: 'screenshot',
}

function detectFileType(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (EXT_TYPE_MAP[ext]) return EXT_TYPE_MAP[ext]
  return FILE_TYPE_MAP[file.type] ?? 'markdown'
}

type DocRow = {
  id: string
  fileName: string
  fileType: string
  parseStatus: string
  _count?: { findings: number }
}

type Props = {
  blueprintId: string
  initialDocuments: DocRow[]
}

export default function DocumentUploadPanel({ blueprintId, initialDocuments }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<DocRow[]>(initialDocuments)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress('Requesting upload URL…')

    try {
      const fileType = detectFileType(file)

      // 1. Get presigned URL
      const urlRes = await fetch('/api/v1/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId, fileName: file.name, fileType }),
      })
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { documentId, presignedUrl } = (await urlRes.json()) as { documentId: string; presignedUrl: string }

      // 2. PUT to presigned URL
      setProgress('Uploading file…')
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) throw new Error('Upload failed')

      // 3. Confirm
      setProgress('Confirming upload…')
      await fetch('/api/v1/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      setDocuments((prev) => [
        { id: documentId, fileName: file.name, fileType, parseStatus: 'uploaded', _count: { findings: 0 } },
        ...prev,
      ])
      setProgress(null)
    } catch (err) {
      setProgress(`Error: ${err instanceof Error ? err.message : 'Upload failed'}`)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleParse(documentId: string) {
    const res = await fetch(`/api/v1/documents/${documentId}/parse`, { method: 'POST' })
    if (res.ok) {
      const { findingsCount } = (await res.json()) as { findingsCount: number }
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === documentId
            ? { ...d, parseStatus: 'parsed', _count: { findings: findingsCount } }
            : d
        )
      )
    }
  }

  async function handleAnalyse(documentId: string) {
    await fetch(`/api/v1/documents/${documentId}/analyse`, { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Upload area */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 border-dashed p-6 flex flex-col items-center gap-3 text-center">
        <p className="text-slate-400 text-sm">Upload a document to analyse</p>
        <p className="text-slate-600 text-xs font-mono">PDF · DOCX · Terraform · Bicep · ARM · CSV · Markdown · PNG</p>
        {progress && <p className="text-azure text-xs font-mono">{progress}</p>}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.tf,.bicep,.json,.md,.markdown,.csv,.png"
          onChange={handleFileChange}
          className="hidden"
          id="doc-upload-input"
        />
        <label
          htmlFor="doc-upload-input"
          className={`px-4 py-2 rounded-lg bg-azure text-white text-sm font-semibold cursor-pointer hover:bg-azure-600 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploading ? 'Uploading…' : 'Choose File'}
        </label>
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <DocumentListCard
              key={doc.id}
              id={doc.id}
              fileName={doc.fileName}
              fileType={doc.fileType}
              parseStatus={doc.parseStatus}
              findingsCount={doc._count?.findings ?? 0}
              onParse={handleParse}
              onAnalyse={handleAnalyse}
            />
          ))}
        </div>
      )}
    </div>
  )
}
