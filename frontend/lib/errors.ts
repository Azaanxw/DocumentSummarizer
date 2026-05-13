const ERROR_MAP: Record<string, string> = {
  "No relevant content found for this question":
    "I couldn't find anything in the document relevant to that. Try asking something more specific.",
  "Document not found":
    "This document couldn't be found. It may have been deleted.",
  "Failed to generate summary and quiz":
    "We couldn't generate the summary right now. Please try again.",
  "Failed to generate flashcards":
    "We couldn't generate flashcards right now. Please try again.",
  "Failed to generate answer":
    "We couldn't generate an answer right now. Please try again.",
  "Failed to upload to S3":
    "Upload failed — couldn't reach storage. Please check your connection and try again.",
  "Failed to save to database":
    "Upload failed — couldn't save the document. Please try again.",
  "Only PDF files are allowed":
    "Only PDF files are supported. Please select a PDF.",
  "Failed to download PDF":
    "Couldn't load the PDF. Please try again.",
}

export function friendlyError(raw: string, fallback: string): string {
  try {
    const detail: string = JSON.parse(raw)?.detail ?? ""
    if (detail) return ERROR_MAP[detail] ?? detail
  } catch {}
  return fallback
}
