'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, ShieldAlert, Wrench, Clock, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Eligibility, InstrumentStatus } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

export function EligibilityBadge({ eligibility, className }: { eligibility: Eligibility; className?: string }) {
  if (eligibility.status === 'eligible') {
    return (
      <Badge variant="success" className={cn('h-6 px-2.5 tracking-wide uppercase', className)}>
        <CheckCircle2 data-icon="inline-start" />
        Eligible to book
      </Badge>
    )
  }
  if (eligibility.status === 'conditional') {
    return (
      <Badge variant="warning" className={cn('h-6 px-2.5 tracking-wide uppercase', className)}>
        <ShieldAlert data-icon="inline-start" />
        Supervised access
      </Badge>
    )
  }
  return (
    <Badge variant="danger" className={cn('h-6 px-2.5 tracking-wide uppercase', className)}>
      <CircleAlert data-icon="inline-start" />
      Prerequisite missing
    </Badge>
  )
}

export function InstrumentStatusPill({ status }: { status: InstrumentStatus }) {
  if (status.kind === 'available') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        Available now
      </span>
    )
  }
  if (status.kind === 'in-use') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-info">
        <Radio className="size-3.5" aria-hidden />
        In use until {status.until}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
      <Wrench className="size-3.5" aria-hidden />
      Maintenance until {status.until}
    </span>
  )
}

export function Countdown({ endsAt, className }: { endsAt: number | null; className?: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (endsAt === null || now === null) {
    return <span className={cn('tabular-nums', className)}>01h 14m 00s</span>
  }
  const remaining = Math.max(0, endsAt - now)
  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  const s = Math.floor((remaining % 60_000) / 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    <span className={cn('tabular-nums', className)}>
      {pad(h)}h {pad(m)}m {pad(s)}s
    </span>
  )
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase', className)}>
      {children}
    </p>
  )
}

export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'info' }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold tabular-nums',
          tone === 'success' && 'text-success',
          tone === 'warning' && 'text-warning',
          tone === 'danger' && 'text-destructive',
          tone === 'info' && 'text-info',
        )}
      >
        {value}
      </span>
    </div>
  )
}

export { Clock }
