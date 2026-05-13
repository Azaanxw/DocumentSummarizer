"use client"

import { useEffect, useImperativeHandle, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import { Skeleton } from "@/components/ui/skeleton"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export interface PdfViewerHandle {
  scrollToPage: (pageNumber: number, snippet?: string) => void
}

interface PdfViewerProps {
  documentId: string
  ref?: React.Ref<PdfViewerHandle>
}

export function PdfViewer({ documentId, ref }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [highlight, setHighlight] = useState<{ page: number; text: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}/pdf`

  // Track container width for responsive page rendering
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Track which page is most visible to show in the fixed indicator
  useEffect(() => {
    if (numPages === 0) return
    const visibleRatios = new Map<number, number>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page)
          visibleRatios.set(page, entry.intersectionRatio)
        }
        let best = 1
        let bestRatio = -1
        visibleRatios.forEach((ratio, page) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = page }
        })
        setCurrentPage(best)
      },
      { root: containerRef.current, threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    )
    pageRefs.current.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [numPages])

  // Imperative handle for citation navigation
  useImperativeHandle(ref, () => ({
    scrollToPage(pageNumber: number, snippet?: string) {
      const el = pageRefs.current.get(pageNumber)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      if (snippet) {
        if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
        setHighlight({ page: pageNumber, text: snippet })
        highlightTimerRef.current = setTimeout(() => setHighlight(null), 4000)
      }
    },
  }))

  function makeTextRenderer(pageNumber: number) {
    return ({ str }: { str: string }) => {
      if (!highlight || highlight.page !== pageNumber || !str) return str
      const escaped = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      return str.replace(
        new RegExp(escaped, "gi"),
        (m) => `<mark style="background:#fef08a;color:inherit;border-radius:2px;padding:0 1px">${m}</mark>`
      )
    }
  }

  return (
    <div className="relative h-full">
      <div ref={containerRef} className="h-full overflow-y-auto bg-muted/30">
        {containerWidth > 0 && (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<Skeleton className="w-full h-64 rounded-none" />}
            error={<p className="p-4 text-sm text-destructive">Failed to load PDF.</p>}
          >
            {Array.from({ length: numPages }, (_, i) => {
              const page = i + 1
              return (
                <div
                  key={page}
                  data-page={page}
                  ref={(el) => {
                    if (el) pageRefs.current.set(page, el)
                    else pageRefs.current.delete(page)
                  }}
                  className="mb-1"
                >
                  <Page
                    key={highlight?.page === page ? `${page}-hl` : page}
                    pageNumber={page}
                    width={containerWidth}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    customTextRenderer={makeTextRenderer(page)}
                  />
                </div>
              )
            })}
          </Document>
        )}
      </div>

      {numPages > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium pointer-events-none select-none backdrop-blur-sm">
          {currentPage} / {numPages}
        </div>
      )}
    </div>
  )
}
