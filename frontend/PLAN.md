 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Lumina — Phase 4 Frontend Implementation Plan

 ▎ Hand this document to a new LLM session. It contains all context needed to implement the frontend from scratch.

 ---
 Project Overview

 Lumina is an AI-powered PDF study tool. The backend is fully complete. The frontend is scaffolded but empty. This plan covers   
 building the entire frontend UI.

 Backend base URL (local): http://localhost:8000
 Frontend location: C:\Users\blizz\Desktop\Projects\Document summarizer\frontend\

 ---
 Backend API Reference

 All endpoints are on the FastAPI backend. No auth headers needed yet (mock user ID is hardcoded server-side).

 ┌────────┬────────────────────┬───────────────────────────────┬────────────────────────────────────────────────────────────┐    
 │ Method │      Endpoint      │             Body              │                          Returns                           │    
 ├────────┼────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────────┤    
 │        │                    │ multipart/form-data file      │ {message, filename, chunks_stored, text_preview,           │    
 │ POST   │ /upload            │ field: file                   │ database_record: [{id, user_id, filename, content,         │    
 │        │                    │                               │ created_at}]}                                              │    
 ├────────┼────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────────┤    
 │ POST   │ /process-document  │ {"document_id": "uuid"}       │ {summary: str, quiz: [{question, options: [str], answer:   │    
 │        │                    │                               │ str}]}                                                     │    
 ├────────┼────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────────┤    
 │ POST   │ /generate-cards    │ {"document_id": "uuid"}       │ {flashcards: [{question, answer}]}                         │    
 ├────────┼────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────────┤    
 │ POST   │ /ask               │ {"document_id": "uuid",       │ {answer: str, citations: [{page_number: int, snippet:      │    
 │        │                    │ "question": "..."}            │ str}]}                                                     │    
 ├────────┼────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────────┤    
 │ GET    │ /dictionary/{word} │ —                             │ {word, phonetic, definition, example, synonyms: [str]}     │    
 └────────┴────────────────────┴───────────────────────────────┴────────────────────────────────────────────────────────────┘    

 ---
 Tech Stack (already configured, do not change)

 - Framework: Next.js 15 App Router
 - Language: TypeScript (strict mode)
 - Styling: Tailwind CSS 4
 - Components: shadcn/ui (base-nova style) using @base-ui/react primitives (NOT Radix UI)
 - Icons: lucide-react
 - Font: Geist (already wired in layout.tsx)
 - Existing shadcn components: Button, Card, Input, ScrollArea (in components/ui/)
 - Utility: cn() from lib/utils.ts

 ---
 Existing File Structure

 frontend/
 ├── app/
 │   ├── globals.css          # Tailwind 4 + OKLch CSS vars + dark mode — DO NOT TOUCH
 │   ├── layout.tsx           # Root layout — update metadata only
 │   └── page.tsx             # Currently boilerplate — rewrite completely
 ├── components/
 │   └── ui/
 │       ├── button.tsx
 │       ├── card.tsx
 │       ├── input.tsx
 │       └── scroll-area.tsx
 ├── lib/
 │   └── utils.ts             # cn() helper
 ├── components.json          # shadcn config
 └── package.json

 ---
 What Needs to Be Built

 1. Environment

 Create frontend/.env.local:
 NEXT_PUBLIC_API_URL=http://localhost:8000

 ---
 2. lib/api.ts — Typed API Layer (build this first)

 All fetch calls go through here. Use NEXT_PUBLIC_API_URL env var as base.

 const BASE = process.env.NEXT_PUBLIC_API_URL

 export async function uploadDocument(file: File)
 // POST /upload — multipart/form-data
 // Returns: { document_id: string, filename: string }

 export async function processDocument(documentId: string)
 // POST /process-document
 // Returns: { summary: string, quiz: QuizQuestion[] }

 export async function generateCards(documentId: string)
 // POST /generate-cards
 // Returns: { flashcards: Flashcard[] }

 export async function askQuestion(documentId: string, question: string)
 // POST /ask
 // Returns: { answer: string, citations: Citation[] }

 export async function lookupWord(word: string)
 // GET /dictionary/{word}
 // Returns: { word, phonetic, definition, example, synonyms }

 Also export the TypeScript types:
 type QuizQuestion = { question: string; options: string[]; answer: string }
 type Flashcard = { question: string; answer: string }
 type Citation = { page_number: number; snippet: string }

 ---
 3. Pages

 app/layout.tsx

 Update metadata only:
 export const metadata = {
   title: 'Lumina',
   description: 'AI-powered PDF study tools',
 }

 app/page.tsx — Landing Page

 Clean hero with upload. Design:
 - Centered layout, full viewport height
 - Large wordmark "Lumina" at top
 - Short tagline below (e.g. "Upload a PDF. Study smarter.")
 - Large UploadZone component below
 - On upload success → router.push('/document/${documentId}')

 app/dashboard/page.tsx — Dashboard

 - Page header: "My Documents" title + Upload button (top right, prominent)
 - Clicking Upload button opens the same upload flow (modal or inline zone)
 - Responsive grid of DocumentCard components
 - Fetch documents list from backend (you'll need to add a GET /documents endpoint — see note below)
 - Empty state: illustration/icon + "Upload your first PDF" CTA button

 ▎ Note: The backend does not yet have a GET /documents endpoint. Add it to FastAPI: query documents table for MOCK_USER_ID,     
 ▎ return [{id, filename, created_at}]. Add this to db_utils.py as get_user_documents(user_id) and wire it into a new endpoint   
 ▎ in main.py.

 app/document/[id]/page.tsx — Document Detail

 - Back button → /dashboard
 - Document filename as heading
 - Three tabs: Summary & Quiz | Flashcards | Ask
 - Each tab loads lazily — only calls the API when that tab is first opened (use state to track which tabs have loaded)
 - Selectable text anywhere on the page triggers DictionaryPopup

 ---
 4. Components to Build

 components/upload-zone.tsx

 - Dashed border box, upload icon, "Drag & drop a PDF or click to browse"
 - accept=".pdf" file input
 - Visual states: idle → dragging (highlight border) → uploading (spinner + progress text) → success
 - On success: calls uploadDocument(), returns document_id
 - Calls onSuccess(documentId: string) prop when done
 - Shows error message if upload fails

 components/document-card.tsx

 - shadcn Card component
 - Shows: PDF icon, filename (truncated), upload date formatted nicely
 - "Open" button → navigates to /document/[id]
 - Subtle hover state

 components/summary-view.tsx

 - Calls processDocument(documentId) on mount
 - Loading skeleton while waiting (Gemini can be slow)
 - Summary: rendered as paragraphs
 - Quiz below: each question as a card with 4 option buttons (A/B/C/D)
 - Click option → reveal if correct/incorrect (green/red highlight), show correct answer

 components/flashcard-deck.tsx

 - Calls generateCards(documentId) on mount
 - Loading skeleton while waiting
 - Single card visible at a time, centered
 - Click card to flip (CSS 3D flip animation) — question front, answer back
 - Prev / Next navigation buttons below
 - Progress indicator: "3 / 10"

 components/qa-chat.tsx

 - Calls askQuestion(documentId, question) on submit
 - Input at bottom with Send button
 - Answer renders above in a chat bubble style
 - CitationBadge components below each answer
 - Loading state while waiting for Gemini response
 - Previous Q&A pairs persist in component state (scroll history)

 components/citation-badge.tsx

 - Small chip: "Page 3" with a bookmark icon
 - Shows snippet in a tooltip on hover
 - onClick prop for future jump-to-page integration

 components/dictionary-popup.tsx

 - Listens for mouseup events on the document
 - Gets selected text via window.getSelection()
 - If single word selected → calls lookupWord(word)
 - Shows popover near selection with: word, phonetic, definition, example, synonyms as tags
 - Dismiss on click outside or Escape key

 ---
 Design Guidelines

 - Palette: Use CSS variables already defined in globals.css — bg-background, text-foreground, text-muted-foreground, border,    
 primary, etc. Do not hardcode colours.
 - Spacing: Generous padding, breathing room between sections
 - Typography: Geist font (already loaded). Large headings for key UI moments.
 - Dark mode: Already configured via .dark class in globals.css — use CSS vars and it works automatically.
 - Minimalism: No decorative elements. Let content breathe. One action per screen where possible.
 - Loading states: Every API call needs a skeleton or spinner — Gemini can take 3-5 seconds.

 ---
 Implementation Order

 1. .env.local — create first
 2. lib/api.ts — typed API layer, everything depends on this
 3. Backend: Add GET /documents endpoint + get_user_documents() to db_utils.py
 4. app/layout.tsx — metadata update
 5. components/upload-zone.tsx
 6. app/page.tsx — landing with upload zone
 7. app/dashboard/page.tsx + components/document-card.tsx
 8. app/document/[id]/page.tsx — tab shell
 9. components/summary-view.tsx
 10. components/flashcard-deck.tsx
 11. components/qa-chat.tsx + components/citation-badge.tsx
 12. components/dictionary-popup.tsx

 ---
 Additional shadcn Components to Install

 Run these in the frontend/ directory as needed:
 npx shadcn@latest add tabs
 npx shadcn@latest add skeleton
 npx shadcn@latest add popover
 npx shadcn@latest add tooltip
 npx shadcn@latest add badge
 npx shadcn@latest add dialog
 npx shadcn@latest add separator

 ---
 Important Notes for the LLM

 - @base-ui/react not Radix UI — shadcn is configured with @base-ui/react. Do not import from @radix-ui/*.
 - Tailwind CSS 4 — use @import syntax not @tailwind directives. Do not modify globals.css.
 - App Router — use Server Components by default. Add "use client" only when using hooks, event handlers, or browser APIs.       
 - No auth yet — skip Supabase auth client. The backend uses a hardcoded mock user ID.
 - API errors — all API functions should throw on non-2xx responses so components can catch and display errors.
 - Streaming — the /ask endpoint does NOT stream. It returns a complete JSON response. No streaming implementation needed.     