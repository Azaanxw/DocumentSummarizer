# Frontend — Document Summarizer (Lumina)

## Overview

Next.js 16 App Router frontend for Lumina. Lets users upload PDFs, then study them via AI-generated summaries, quizzes, flashcards, and RAG-powered Q&A. Includes a dictionary popup for any selected word. Talks to the FastAPI backend over HTTP — no auth headers needed (mock user ID is hardcoded server-side).

## Directory Structure

```
frontend/
├── app/
│   ├── globals.css                  # Tailwind 4 + OKLch CSS vars + dark mode — DO NOT TOUCH
│   ├── layout.tsx                   # Root layout — Geist font, metadata
│   ├── page.tsx                     # Landing page — upload zone + wordmark
│   ├── dashboard/
│   │   └── page.tsx                 # Document grid with upload toggle
│   └── document/
│       └── [id]/
│           └── page.tsx             # Study tools — Summary/Quiz, Flashcards, Ask tabs
├── components/
│   ├── upload-zone.tsx              # Drag-and-drop PDF uploader
│   ├── document-card.tsx            # Card for a document in the dashboard grid
│   ├── summary-view.tsx             # Summary paragraphs + interactive quiz
│   ├── flashcard-deck.tsx           # 3D flip flashcard carousel
│   ├── qa-chat.tsx                  # Chat-style Q&A with citation badges
│   ├── citation-badge.tsx           # "Page N" chip shown below Q&A answers
│   ├── dictionary-popup.tsx         # Word-selection popup using Free Dictionary API
│   └── ui/                          # shadcn/ui components (base-nova style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       ├── tabs.tsx
│       ├── skeleton.tsx
│       ├── badge.tsx
│       └── separator.tsx
├── lib/
│   ├── api.ts                       # Typed fetch layer for all backend endpoints
│   └── utils.ts                     # cn() helper (clsx + tailwind-merge)
├── .env.local                       # NEXT_PUBLIC_API_URL (not committed)
├── components.json                  # shadcn config — style: base-nova, @base-ui/react
├── next.config.ts
├── tailwind.config (inline via CSS) # Tailwind 4 — configured in globals.css
└── package.json
```

---

## Tech Stack

| Item | Detail |
|---|---|
| Framework | Next.js 16.2.6 — App Router |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 — `@import` syntax, no `@tailwind` directives |
| Components | shadcn/ui `base-nova` style — uses `@base-ui/react` primitives, **not** Radix UI |
| Icons | lucide-react |
| Font | Geist (loaded via `next/font/google` in layout.tsx) |

---

## Files

### `lib/api.ts`
All fetch calls go here. Reads `NEXT_PUBLIC_API_URL` as the base URL. Every function throws on non-2xx so components can catch and display errors.

**Types exported:**

| Type | Shape |
|---|---|
| `DocumentMeta` | `{ id: string; filename: string; created_at: string }` |
| `QuizQuestion` | `{ question: string; options: string[]; answer: string }` |
| `Flashcard` | `{ question: string; answer: string }` |
| `Citation` | `{ page_number: number; snippet: string }` |

**Functions exported:**

| Function | Method | Endpoint | Returns |
|---|---|---|---|
| `uploadDocument(file)` | POST | `/upload` | `{ document_id, filename }` — extracts `id` from `database_record[0].id` |
| `listDocuments()` | GET | `/documents` | `DocumentMeta[]` |
| `processDocument(documentId)` | POST | `/process-document` | `{ summary: string, quiz: QuizQuestion[] }` |
| `generateCards(documentId)` | POST | `/generate-cards` | `{ flashcards: Flashcard[] }` |
| `askQuestion(documentId, question)` | POST | `/ask` | `{ answer: string, citations: Citation[] }` |
| `lookupWord(word)` | GET | `/dictionary/{word}` | `{ word, phonetic, definition, example, synonyms }` |

---

### `app/layout.tsx`
Root layout. Loads Geist and Geist Mono via `next/font/google`, injects CSS variables into `<html>`. Metadata: `title: "Lumina"`, `description: "AI-powered PDF study tools"`.

---

### `app/page.tsx` — Landing Page
**Client component.** Full-viewport centered layout with:
- Large "Lumina" wordmark
- "Upload a PDF. Study smarter." tagline
- `<UploadZone>` — on success, calls `router.push('/document/${id}')`
- Link to `/dashboard` for returning users

---

### `app/dashboard/page.tsx` — Dashboard
**Client component.** Fetches `listDocuments()` on mount.

| State | Behaviour |
|---|---|
| Loading | 6-cell skeleton grid |
| Empty | FileText icon + "Upload your first PDF" CTA |
| Populated | Responsive grid of `DocumentCard` components |

Upload button in the header toggles an inline `<UploadZone>`. On upload success, redirects to the new document page.

---

### `app/document/[id]/page.tsx` — Document Detail
**Client component.** Gets document ID via `useParams<{ id: string }>()`.

Three shadcn `Tabs`:

| Tab value | Component rendered |
|---|---|
| `summary` | `<SummaryView>` |
| `flashcards` | `<FlashcardDeck>` |
| `ask` | `<QAChat>` |

All three `TabsContent` use `keepMounted` — components stay in the DOM when switching tabs so API calls are made once and state is preserved. `<DictionaryPopup>` is mounted at the page level so it works across all tabs.

---

## Components

### `components/upload-zone.tsx`
**Client component.** Accepts a single prop: `onSuccess(documentId: string)`.

| State | Visual |
|---|---|
| `idle` | Dashed border, upload icon, instruction text |
| `dragging` | Border highlights to primary colour |
| `uploading` | Spinner + "Uploading and processing…" |
| `success` | Green checkmark |
| `error` | Red alert icon + error message + "Click to try again" |

Handles drag-and-drop and click-to-browse. Validates PDF mime type client-side before calling `uploadDocument()`.

---

### `components/document-card.tsx`
**Client component.** Uses shadcn `Card`. Props: `doc: DocumentMeta`.

- Strips the UUID prefix from the stored S3 filename for display (`uuid_originalname.pdf` → `originalname.pdf`)
- Formats `created_at` with `toLocaleDateString`
- "Open" button navigates to `/document/[id]`

---

### `components/summary-view.tsx`
**Client component.** Props: `documentId: string`.

- Calls `processDocument(documentId)` once on mount (guarded with a `cancelled` ref to prevent React Strict Mode double-invocation)
- Loading: 6-line skeleton
- Summary rendered as `<p>` per `\n\n`-split paragraph
- Quiz: each `QuizQuestion` in a shadcn `Card` with 4 option buttons
  - Options are disabled after first click
  - Correct option turns green; wrong selection turns red
  - Correct answer shown as text if user picked wrong

---

### `components/flashcard-deck.tsx`
**Client component.** Props: `documentId: string`.

- Calls `generateCards(documentId)` once on mount (cancelled-ref guard)
- Loading: skeleton card + button skeletons
- CSS 3D flip animation: `transform-style: preserve-3d`, `rotateY(180deg)` on click
  - Front: question
  - Back: answer
- Prev / Next buttons + "N / 10" counter
- Restart button resets to card 1 face-up

---

### `components/qa-chat.tsx`
**Client component.** Props: `documentId: string`.

- Message history kept in component state: `Array<{ question, answer, citations }>`
- `ScrollArea` for the message list; auto-scrolls to latest answer
- Each answer bubble shows `CitationBadge` chips below it
- Loading: spinner bubble while waiting for response
- Error shown inline below the input bar

---

### `components/citation-badge.tsx`
Presentational (no `"use client"` needed). Props: `pageNumber`, `snippet`, optional `onClick`.

- Renders a small chip: `<Bookmark icon> Page N`
- `title={snippet}` for native hover tooltip
- Conditionally applies pointer cursor and hover styles when `onClick` is provided

---

### `components/dictionary-popup.tsx`
**Client component.** No props — attaches its own global event listeners.

- `mouseup`: reads `window.getSelection()`, ignores if empty or contains whitespace (multi-word)
- Positions popup at `getBoundingClientRect()` of the selection range + 8px below
- Calls `lookupWord(word)`, shows popup on success, silently discards 404s
- Dismiss: `mousedown` outside popup, or `Escape` key
- Popup content: word + phonetic, definition, italic example quote, synonym `Badge` chips

---

## Design System

All colours come from CSS custom properties defined in `globals.css`. Never hardcode hex/rgb values.

| Token | Usage |
|---|---|
| `bg-background` / `text-foreground` | Page base |
| `text-muted-foreground` | Secondary labels, placeholders |
| `border` | All borders |
| `bg-muted` | Subtle surface (tabs list, input bg) |
| `bg-card` | Card surfaces |
| `primary` / `primary-foreground` | CTA buttons, active states |
| `destructive` | Errors |

Dark mode is automatic — add `class="dark"` to `<html>` to switch.

---

## Running Locally

```powershell
# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

App available at `http://localhost:3000`. Backend must also be running at `http://localhost:8000`.

---

## Environment Variables

**`.env.local`** — never committed.

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`NEXT_PUBLIC_*` variables are inlined at build time and available in Client Components.

---

## Key Next.js 16 Patterns Used

- **`useParams<{ id: string }>()`** from `next/navigation` — dynamic route params in Client Components (params is a Promise in Server Components only)
- **`"use client"`** — added only to components that use hooks, event handlers, or browser APIs
- **Turbopack** — default in v16, no flags needed
- **`keepMounted`** on `TabsContent` — base-ui prop that keeps panel in DOM after first activation
