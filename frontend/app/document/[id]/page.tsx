"use client"

import { useParams, useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { type PdfViewerHandle } from "@/components/pdf-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryView } from "@/components/summary-view"
import { FlashcardDeck } from "@/components/flashcard-deck"
import { QAChat } from "@/components/qa-chat"
import { PdfViewer } from "@/components/pdf-viewer"
import { DictionaryPopup } from "@/components/dictionary-popup"
import { getCacheStatus, generateCards, type Flashcard } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Layers, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function DocumentPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const pdfRef = useRef<PdfViewerHandle>(null)
  const [tab, setTab] = useState("summary")
  const [flashcardsUnlocked, setFlashcardsUnlocked] = useState(false)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [preloadedCards, setPreloadedCards] = useState<Flashcard[] | null>(null)

  useEffect(() => {
    getCacheStatus(id).then((s) => {
      if (s.has_flashcards) setFlashcardsUnlocked(true)
    }).catch(() => {})
  }, [id])

  function onCitationClick(pageNumber: number, snippets: string[]) {
    pdfRef.current?.scrollToPage(pageNumber, snippets)
  }

  async function handleGenerateFlashcards() {
    setGeneratingFlashcards(true)
    try {
      const result = await generateCards(id)
      setPreloadedCards(result.flashcards)
      setFlashcardsUnlocked(true)
      setTab("flashcards")
    } catch {
      // generation failed — silently reset so user can retry
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ChevronLeft className="size-4" />
          Dashboard
        </Button>
      </header>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — PDF viewer */}
        <div className="w-2/5 shrink-0 border-r overflow-hidden h-full">
          <PdfViewer documentId={id} ref={pdfRef} />
        </div>

        {/* Right — study tools + ask */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Study tools (scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <Tabs value={tab} onValueChange={setTab}>
              <div className="flex items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="summary">Summary &amp; Quiz</TabsTrigger>
                  {flashcardsUnlocked && (
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                  )}
                </TabsList>
                {!flashcardsUnlocked && (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleGenerateFlashcards} disabled={generatingFlashcards}>
                    {generatingFlashcards
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Layers className="size-3.5" />
                    }
                    {generatingFlashcards ? "Generating…" : "Generate Flashcards"}
                  </Button>
                )}
              </div>

              <TabsContent value="summary" keepMounted>
                <SummaryView documentId={id} />
              </TabsContent>

              {flashcardsUnlocked && (
                <TabsContent value="flashcards">
                  <FlashcardDeck documentId={id} initialCards={preloadedCards ?? undefined} />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Ask chatbox (pinned to bottom) */}
          <Separator />
          <div className="shrink-0 h-[280px] flex flex-col gap-2 px-5 pt-3 pb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Ask</p>
            <QAChat documentId={id} onCitationClick={onCitationClick} />
          </div>

        </div>
      </div>

      <DictionaryPopup />
    </div>
  )
}
