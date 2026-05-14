"use client"

import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import type { DocumentMeta } from "@/lib/api"

interface DocumentCardProps {
  doc: DocumentMeta
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const router = useRouter()

  const displayName = doc.filename
    .replace(/^[0-9a-f-]{36}_/, "")
    .replace(/\.pdf$/i, "")

  const date = new Date(doc.created_at).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <button
      onClick={() => router.push(`/document/${doc.id}`)}
      className="group flex w-full flex-col gap-4 rounded-xl border bg-card p-5 text-left transition-all hover:border-border/80 hover:shadow-sm hover:bg-muted/30"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground leading-snug">{displayName}</p>
        <p className="mt-1 text-xs text-muted-foreground">{date}</p>
      </div>
    </button>
  )
}
