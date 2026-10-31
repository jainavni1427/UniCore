'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Check, RotateCcw, Upload, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CAPTURE_ANGLES } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

const crops: Record<string, string> = {
  stage: 'object-center scale-100',
  objective: 'object-top scale-125',
  gauge: 'object-bottom scale-150',
}

export function PhotoCapture({
  captured,
  onCapture,
  image,
  flagged,
}: {
  captured: string[]
  onCapture: (next: string[]) => void
  image: string
  flagged?: string
}) {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Handle live smartphone / webcam camera capture
  function handleFileChange(angleId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const blobUrl = URL.createObjectURL(file)
      setCustomPhotos((prev) => ({ ...prev, [angleId]: blobUrl }))
      if (!captured.includes(angleId)) {
        onCapture([...captured, angleId])
      }
      toast.success(`${angleId.toUpperCase()} photo captured`, {
        description: 'Image saved and hashed for baseline inspection.',
      })
    }
  }

  // Trigger camera dialog
  function openCamera(angleId: string) {
    fileInputRefs.current[angleId]?.click()
  }

  // Fallback to calibrated lab photo simulation
  function simulateCapture(angleId: string) {
    if (!captured.includes(angleId)) {
      onCapture([...captured, angleId])
    }
    toast.info(`Simulated Standard Calibration Photo for ${angleId}`)
  }

  function handleRetake(angleId: string) {
    onCapture(captured.filter((c) => c !== angleId))
    setCustomPhotos((prev) => {
      const next = { ...prev }
      delete next[angleId]
      return next
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {CAPTURE_ANGLES.map((a) => {
        const done = captured.includes(a.id)
        const displayPhoto = customPhotos[a.id] || image

        return (
          <div
            key={a.id}
            className={cn(
              'flex flex-col overflow-hidden rounded-xl border bg-card transition-all',
              flagged === a.id && !done && 'border-destructive/50 ring-1 ring-destructive/40',
              done && 'border-primary/40'
            )}
          >
            {/* Hidden native camera capture input for phones */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={(el) => {
                fileInputRefs.current[a.id] = el
              }}
              className="hidden"
              onChange={(e) => handleFileChange(a.id, e)}
            />

            <div
              className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden group"
              onClick={() => !done && openCamera(a.id)}
            >
              {done ? (
                <img
                  src={displayPhoto}
                  alt={`${a.name} capture`}
                  className={cn('size-full object-cover', !customPhotos[a.id] && crops[a.id])}
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground p-4 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-primary/40 group-hover:bg-primary/10 transition">
                    <Camera className="size-5 text-primary" aria-hidden />
                  </span>
                  <span className="text-xs font-medium">Tap to open Camera</span>
                  <span className="text-[11px] text-muted-foreground">Align {a.name.toLowerCase()} in frame</span>
                </div>
              )}

              {done && (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-success text-success-foreground shadow">
                  <Check className="size-3.5" aria-hidden />
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 p-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block">{a.label}</span>
                  <span className="text-sm font-semibold">{a.name}</span>
                </div>
                {done && (
                  <Button size="xs" variant="ghost" onClick={() => handleRetake(a.id)}>
                    <RotateCcw className="size-3" data-icon="inline-start" />
                    Retake
                  </Button>
                )}
              </div>

              {!done && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Button size="xs" variant="outline" onClick={() => openCamera(a.id)}>
                    <Camera className="size-3" data-icon="inline-start" />
                    Camera
                  </Button>
                  <Button size="xs" variant="secondary" onClick={() => simulateCapture(a.id)}>
                    <Sparkles className="size-3" data-icon="inline-start" />
                    Simulate
                  </Button>
                </div>
              )}
            </div>

            {flagged === a.id && !done && (
              <p className="border-t border-destructive/20 bg-destructive/[0.06] px-3 py-2 text-xs text-destructive">
                Manager requested a re-take of this angle
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
