import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface CitationBadgeProps {
  pageNumber: number
  snippet: string
  onClick?: () => void
}

export function CitationBadge({ pageNumber, snippet, onClick }: CitationBadgeProps) {
  return (
    <button
      title={snippet}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors",
        onClick && "cursor-pointer hover:bg-accent hover:text-accent-foreground",
        !onClick && "cursor-default"
      )}
    >
      <Bookmark className="size-3" />
      Page {pageNumber}
    </button>
  )
}
