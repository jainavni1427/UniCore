'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MoveHorizontal } from 'lucide-react'

export function CompareSlider({
  before,
  after,
  beforeLabel = 'Check-in baseline',
  afterLabel = 'Return capture',
  anomaly,
}: {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
  anomaly?: { top: string; left: string; size: string; label: string }
}) {
  const [pos, setPos] = useState(50)

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted select-none">
      <Image src={after} alt={afterLabel} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeLabel} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>

      {anomaly && pos < 90 && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-destructive shadow-[0_0_0_4px_oklch(0.63_0.2_25/0.2)]"
          style={{ top: anomaly.top, left: anomaly.left, width: anomaly.size, height: anomaly.size }}
        >
          <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white">
            {anomaly.label}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/90" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg">
          <MoveHorizontal className="size-4" aria-hidden />
        </span>
      </div>

      <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">{beforeLabel}</span>
      <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">{afterLabel}</span>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare baseline and return images"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}
