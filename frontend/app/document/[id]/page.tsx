"use client"

import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryView } from "@/components/summary-view"
import { FlashcardDeck } from "@/components/flashcard-deck"
import { QAChat } from "@/components/qa-chat"
import { DictionaryPopup } from "@/components/dictionary-popup"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function DocumentPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  return (
    <div className="relative min-h-svh">
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="size-4" />
            Dashboard
          </Button>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Study Tools</h1>

        <Tabs defaultValue="summary">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="summary">Summary &amp; Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="ask">Ask</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" keepMounted>
            <SummaryView documentId={id} />
          </TabsContent>

          <TabsContent value="flashcards" keepMounted>
            <FlashcardDeck documentId={id} />
          </TabsContent>

          <TabsContent value="ask" keepMounted>
            <QAChat documentId={id} />
          </TabsContent>
        </Tabs>
      </main>

      <DictionaryPopup />
    </div>
  )
}
