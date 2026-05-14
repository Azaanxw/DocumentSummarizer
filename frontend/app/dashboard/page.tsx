"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { listDocuments, type DocumentMeta } from "@/lib/api"
import { friendlyError } from "@/lib/errors"
import { DocumentCard } from "@/components/document-card"
import { UploadZone } from "@/components/upload-zone"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const router = useRouter()
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    listDocuments()
      .then((data) => { if (!cancelled) setDocs(data) })
      .catch((err) => { if (!cancelled) setError(friendlyError(err instanceof Error ? err.message : "", "Failed to load your documents. Please refresh.")) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function onUploadSuccess(id: string) {
    router.push(`/document/${id}`)
  }

  return (
    <main className="min-h-svh px-6 py-10 max-w-5xl mx-auto w-full space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">My Documents</h1>

      <div className="rounded-2xl border bg-card p-6">
        <UploadZone onSuccess={onUploadSuccess} />
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-muted-foreground text-center py-4">{error}</p>}

      {!loading && docs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </main>
  )
}
