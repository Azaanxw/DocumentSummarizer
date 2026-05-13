"use client"

import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DocumentMeta } from "@/lib/api"

interface DocumentCardProps {
  doc: DocumentMeta
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const router = useRouter()

  const displayName = doc.filename.replace(/^[0-9a-f-]{36}_/, "")

  const date = new Date(doc.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="flex flex-col gap-0 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 pt-6">
        <FileText className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium leading-snug line-clamp-2 break-all">{displayName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{date}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => router.push(`/document/${doc.id}`)}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  )
}
