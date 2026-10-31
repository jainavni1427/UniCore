'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, ShieldCheck, Gauge, Sparkles, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAppState } from '@/components/app-state'
import { InstrumentStatusPill, SectionLabel } from '@/components/unicore/status'
import { CREDENTIAL_DEFS, type Instrument } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'
import { BookingPanel } from './booking-panel'

export function InstrumentDetail({ instrument }: { instrument: Instrument }) {
  const { heldCredentialIds } = useAppState()
  const [index, setIndex] = useState(0)
  const images = instrument.images
  const t = instrument.telemetry
  const filamentPct = Math.round((t.filamentHours / t.filamentLimit) * 100)

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/explore"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {instrument.category}
              </span>
              <InstrumentStatusPill status={instrument.status} />
              <span className="text-xs text-muted-foreground">Unit {instrument.unitId}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance lg:text-3xl">{instrument.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden />
              {instrument.institution} · {instrument.facility} · {instrument.distanceKm} km away
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-foreground/80">{instrument.summary}</p>
          </header>

          <figure className="flex flex-col gap-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
              <Image
                src={images[index].src}
                alt={images[index].alt}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
              {images.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-background/70 backdrop-blur"
                    aria-label="Previous image"
                    onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-background/70 backdrop-blur"
                    aria-label="Next image"
                    onClick={() => setIndex((i) => (i + 1) % images.length)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{images[index].alt}</span>
              {images.length > 1 && (
                <span className="flex gap-1.5">
                  {images.map((img, i) => (
                    <button
                      key={img.src}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === index}
                      className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-foreground' : 'w-1.5 bg-muted-foreground/40')}
                    />
                  ))}
                </span>
              )}
            </figcaption>
          </figure>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Trust signals">
            <TrustTile icon={Gauge} label="Filament lifetime">
              <p className="text-lg font-semibold tabular-nums">
                {t.filamentHours.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ {t.filamentLimit.toLocaleString()} h</span>
              </p>
              <Progress value={filamentPct} />
            </TrustTile>
            <TrustTile icon={Sparkles} label="Clean return streak">
              <p className="text-lg font-semibold text-success tabular-nums">
                {t.cleanStreak} <span className="text-sm font-normal text-muted-foreground">consecutive</span>
              </p>
              <p className="text-xs text-muted-foreground">No damage incidents logged</p>
            </TrustTile>
            <TrustTile icon={UserCheck} label="Custodian">
              <p className="text-sm font-semibold">{t.custodian}</p>
              <p className={cn('text-xs', t.custodianOnDuty ? 'text-success' : 'text-muted-foreground')}>
                {t.custodianOnDuty ? 'On duty now' : 'Off duty · on-call'}
              </p>
            </TrustTile>
          </section>

          <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <SectionLabel>Specifications</SectionLabel>
              <dl className="flex flex-col divide-y rounded-xl border bg-card text-sm">
                {instrument.specs.map((s, i) => (
                  <div key={s} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <dt className="text-muted-foreground">Spec {i + 1}</dt>
                    <dd className="font-medium">{s}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">Rate</dt>
                  <dd className="font-medium tabular-nums">
                    ${instrument.ratePerHour}/hr · {instrument.creditsPerHour} credits/hr
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-3">
              <SectionLabel>Prerequisites</SectionLabel>
              <ul className="flex flex-col divide-y rounded-xl border bg-card text-sm">
                {instrument.prerequisites.map((p) => {
                  const held = heldCredentialIds.has(p)
                  return (
                    <li key={p} className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className={cn('size-4', held ? 'text-success' : 'text-destructive')} aria-hidden />
                        {CREDENTIAL_DEFS[p]?.name}
                      </span>
                      <span className={cn('text-xs font-medium', held ? 'text-success' : 'text-destructive')}>
                        {held ? 'In passport' : 'Missing'}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <SectionLabel className="mt-3">Operating constraints</SectionLabel>
              <ul className="flex flex-col gap-2 text-sm text-foreground/85">
                {instrument.constraints.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <BookingPanel instrument={instrument} />
        </div>
      </div>
    </div>
  )
}

function TrustTile({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <Separator className="opacity-0" />
      {children}
    </div>
  )
}
