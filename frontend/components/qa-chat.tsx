"use client"

import { useRef, useState } from "react"
import { askQuestion, type Citation } from "@/lib/api"
import { friendlyError } from "@/lib/errors"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CitationBadge } from "@/components/citation-badge"
import { Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  question: string
  answer?: string
  citations?: Citation[]
  error?: string
}

interface QAChatProps {
  documentId: string
  compact?: boolean
  onCitationClick?: (pageNumber: number, snippet: string) => void
}

export function QAChat({ documentId, compact, onCitationClick }: QAChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setInput("")
    setLoading(true)

    setMessages((prev) => [...prev, { question }])
    scrollToBottom()

    try {
      const result = await askQuestion(documentId, question)
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1
            ? { ...msg, answer: result.answer, citations: result.citations }
            : msg
        )
      )
      scrollToBottom()
    } catch (err) {
      const raw = err instanceof Error ? err.message : ""
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === prev.length - 1 ? { ...msg, error: friendlyError(raw) } : msg
        )
      )
      scrollToBottom()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <ScrollArea className={compact ? "h-44 rounded-xl border bg-muted/20 p-4" : "h-[420px] rounded-xl border bg-muted/20 p-4"}>
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-16">
            Ask anything about this document.
          </p>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {msg.question}
                </div>
              </div>

              {/* Bot bubble */}
              <div className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
                  {msg.error ? (
                    <div className="rounded-2xl rounded-tl-sm border border-dashed px-4 py-2.5 text-sm text-muted-foreground italic">
                      {msg.error}
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-2.5 text-sm text-foreground leading-relaxed">
                      {msg.answer === undefined ? <TypingIndicator /> : msg.answer}
                    </div>
                  )}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {msg.citations.map((c, j) => (
                        <CitationBadge
                          key={j}
                          pageNumber={c.page_number}
                          snippet={c.snippet}
                          onClick={onCitationClick ? () => onCitationClick(c.page_number, c.snippet) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

function TypingIndicator() {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </span>
  )
}
