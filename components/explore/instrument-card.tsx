'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, MapPin, Activity, CalendarClock, ShieldCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EligibilityBadge, InstrumentStatusPill } from '@/components/unicore/status'
import { PrerequisiteDialog } from '@/components/unicore/prerequisite-dialog'
import { CREDENTIAL_DEFS, type Eligibility, type Instrument } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

export function InstrumentCard({ instrument, eligibility }: { instrument: Instrument; eligibility: Eligibility }) {
  const [open, setOpen] = useState(false)
  const href = `/explore/${instrument.id}`
  const blocked = eligibility.status === 'missing'

  return (
    <article
      className={cn(
        'group flex flex-col rounded-xl border bg-card transition-colors hover:border-foreground/15',
        blocked && 'bg-card/70',
      )}
      aria-labelledby={`${instrument.id}-title`}
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {instrument.category}
              </span>
              <InstrumentStatusPill status={instrument.status} />
            </div>
            <h3 id={`${instrument.id}-title`} className="text-base leading-snug font-semibold text-balance">
              <Link href={href} className="outline-none hover:underline focus-visible:underline">
                {instrument.shortName}
              </Link>
            </h3>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {instrument.institution} · {instrument.facility}
              </span>
              <span className="shrink-0 tabular-nums">· {instrument.distanceKm} km</span>
            </p>
          </div>
          <EligibilityBadge eligibility={eligibility} />
        </div>

        <ul className="flex flex-wrap gap-1.5" aria-label="Key specifications">
          {instrument.specs.map((s) => (
            <li key={s} className="rounded-md bg-muted px-2 py-1 text-xs text-foreground/80">
              {s}
            </li>
          ))}
        </ul>

        {blocked && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/[0.06] px-3 py-2 text-xs leading-relaxed text-destructive">
            Missing: {eligibility.missing.map((m) => CREDENTIAL_DEFS[m]?.name).join(', ')}
          </p>
        )}
        {eligibility.status === 'conditional' && (
          <p className="rounded-lg border border-warning/20 bg-warning/[0.06] px-3 py-2 text-xs leading-relaxed text-warning">
            Level 1 operators must book with a facility supervisor present.
          </p>
        )}
      </div>

      <Separator />

      <dl className="grid grid-cols-3 gap-4 px-5 py-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">Rate</dt>
          <dd className="font-semibold tabular-nums">
            ${instrument.ratePerHour}
            <span className="font-normal text-muted-foreground">/hr</span>
          </dd>
          <dd className="text-xs text-muted-foreground tabular-nums">{instrument.creditsPerHour} credits/hr</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="size-3" aria-hidden /> Health index
          </dt>
          <dd
            className={cn(
              'font-semibold tabular-nums',
              instrument.healthIndex >= 95 ? 'text-success' : instrument.healthIndex >= 90 ? 'text-foreground' : 'text-warning',
            )}
          >
            {instrument.healthIndex.toFixed(1)}%
          </dd>
          <dd className="text-xs text-muted-foreground">Clean returns</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3" aria-hidden /> Next slot
          </dt>
          <dd className="font-semibold">{instrument.nextAvailable}</dd>
          <dd className="text-xs text-muted-foreground">{instrument.peakBufferMins} min buffer</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2 border-t px-5 py-3">
        <span className="mr-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" aria-hidden />
          {instrument.prerequisites.length} prerequisites
        </span>
        {blocked ? (
          <>
            <Link
              href={href}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              View specs
            </Link>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              Resolve prerequisite
            </Button>
          </>
        ) : (
          <Link
            href={href}
            className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
          >
            View specs & book
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>

      {blocked && <PrerequisiteDialog instrument={instrument} open={open} onOpenChange={setOpen} />}
    </article>
  )
}
