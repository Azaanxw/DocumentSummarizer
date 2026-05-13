"use client"

import { useRouter } from "next/navigation"
import { UploadZone } from "@/components/upload-zone"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Lumina</h1>
          <p className="text-lg text-muted-foreground">Upload a PDF. Study smarter.</p>
        </div>

        <UploadZone onSuccess={(id) => router.push(`/document/${id}`)} />

        <p className="text-center text-xs text-muted-foreground">
          Already uploaded?{" "}
          <a href="/dashboard" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Go to dashboard
          </a>
        </p>
      </div>
    </main>
  )
}
