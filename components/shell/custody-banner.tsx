'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useAppState } from '@/components/app-state'
import { Countdown } from '@/components/unicore/status'

export function CustodyBanner() {
  const { persona, sessionActive, sessionEndsAt } = useAppState()
  const pathname = usePathname()

  if (persona.id !== 'researcher' || !sessionActive || pathname.includes('/return')) return null

  return (
    <div className="border-b border-success/20 bg-success/[0.07]" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm lg:px-6">
        <span className="flex items-center gap-2 font-semibold text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live custody
        </span>
        <span className="text-foreground/90">
          You have 1 active session on <span className="font-medium text-foreground">Zeiss Crossbeam 550</span>
        </span>
        <span className="hidden text-muted-foreground sm:inline">·</span>
        <span className="text-muted-foreground">
          Ends in <Countdown endsAt={sessionEndsAt} className="font-medium text-foreground" />
        </span>
        <span className="hidden text-muted-foreground lg:inline">· Chamber vacuum nominal</span>
        <Link
          href="/bookings/BK-9058/return"
          className="ml-auto inline-flex items-center gap-1 rounded-md font-medium text-success hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Open session HUD
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
