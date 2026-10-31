'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ArrowLeft, ArrowRight, Gauge, Loader2, ScanSearch, Thermometer, TriangleAlert, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { useAppState } from '@/components/app-state'
import { Countdown, SectionLabel } from '@/components/unicore/status'
import { CompareSlider } from '@/components/unicore/compare-slider'
import { CAPTURE_ANGLES, type Booking, type Instrument } from '@/lib/unicore-data'
import { Stepper } from './stepper'
import { PhotoCapture } from './photo-capture'

const STEPS = ['Session HUD', 'Exit evidence', 'AI inspection', 'Submit return']

export function ReturnFlow({ booking, instrument }: { booking: Booking; instrument: Instrument }) {
  const router = useRouter()
  const { sessionEndsAt, sessionActive, endSession, setBookingStatus, pushNotification } = useAppState()
  const [step, setStep] = useState(sessionActive ? 0 : 3)
  const [captured, setCaptured] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [meter, setMeter] = useState('1423.52')
  const [note, setNote] = useState('')
  const meterValid = /^\d{1,5}(\.\d{1,2})?$/.test(meter)

  async function runInspection() {
    setStep(2)
    setAnalyzing(true)

    try {
      const res = await fetch('/api/diff-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          beforePhoto: '/inspection/stage-baseline.jpg',
          afterPhoto: '/inspection/stage-return.jpg',
        }),
      })
      const data = await res.json()
      if (data.provider) {
        toast.info(`Inspection analyzed via ${data.provider}`)
      }
    } catch (e) {
      console.warn('Inspection API fallback:', e)
    } finally {
      setTimeout(() => setAnalyzing(false), 1400)
    }
  }

  function submit() {
    endSession()
    setBookingStatus(booking.id, 'completed')
    pushNotification({
      tone: 'warning',
      title: 'Return submitted — under review',
      body: 'AI flagged one anomaly on the stage clip. Facility manager will review within 2 hours.',
      action: { label: 'View receipt', href: `/bookings/${booking.id}/receipt` },
    })
    toast.success('Return submitted', { description: 'Custody released. Your receipt is ready.' })
    router.push(`/bookings/${booking.id}/receipt`)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link href="/bookings" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to bookings
      </Link>

      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">
            {booking.id} · {booking.slot}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{instrument.shortName}</h1>
        </div>
        <div className="flex flex-col md:items-end">
          <span className="text-xs text-muted-foreground">Custody time remaining</span>
          {sessionActive ? (
            <Countdown endsAt={sessionEndsAt} className="text-3xl font-semibold text-success" />
          ) : (
            <span className="text-3xl font-semibold text-muted-foreground">Ended</span>
          )}
        </div>
      </header>

      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Telemetry icon={Gauge} label="Chamber vacuum" value="2.1 × 10⁻⁶" unit="mbar" ok />
            <Telemetry icon={Zap} label="Beam current" value="1.42" unit="nA" ok />
            <Telemetry icon={Thermometer} label="Stage temp" value="21.8" unit="°C" ok />
            <Telemetry icon={Activity} label="Filament" value="1,421.9" unit="hrs" ok />
          </div>
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
            <SectionLabel>Session log</SectionLabel>
            <ol className="flex flex-col gap-2.5 text-sm">
              <LogRow time="14:02" text="Custody started — QR verified, 3 baseline photos hashed" />
              <LogRow time="14:09" text="Chamber pumped to operating vacuum" />
              <LogRow time="14:31" text="Beam on at 5 kV, working distance 5.1 mm" />
              <LogRow time="15:48" text="FIB milling cross-section, 30 kV Ga⁺" />
            </ol>
          </div>
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] p-4 sm:flex-row sm:items-center">
            <p className="text-sm">
              Return early to release unused time back to the queue and earn a{' '}
              <span className="font-medium text-warning">+3 fairness bonus</span>.
            </p>
            <Button onClick={() => setStep(1)}>
              End session & return
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-5 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">Capture exit condition</h2>
            <p className="text-sm text-muted-foreground">Match the same framing as your check-in photos.</p>
          </div>
          <PhotoCapture captured={captured} onCapture={setCaptured} image="/inspection/stage-return.jpg" flagged="objective" />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={runInspection} disabled={captured.length < CAPTURE_ANGLES.length}>
              <ScanSearch data-icon="inline-start" />
              Run AI inspection
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <CompareSlider
            before="/inspection/stage-baseline.jpg"
            after="/inspection/stage-return.jpg"
            anomaly={analyzing ? undefined : { top: '38%', left: '44%', size: '18%', label: 'Scratch · 0.4 mm' }}
          />
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-5" aria-live="polite">
            {analyzing ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
                <p className="text-sm font-medium">Comparing against baseline</p>
                <p className="text-xs text-muted-foreground">Aligning 3 angle pairs and running surface diff…</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <SectionLabel>AI inspection result</SectionLabel>
                  <Badge variant="warning">1 anomaly</Badge>
                </div>
                <ul className="flex flex-col divide-y rounded-lg border text-sm">
                  <InspectionRow angle="Stage" result="Surface scratch on stub clip" tone="warning" />
                  <InspectionRow angle="Objective" result="No change detected" tone="success" />
                  <InspectionRow angle="Gauge" result="Reading consistent" tone="success" />
                </ul>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                  Confidence 0.81. Minor clip wear is common; a manager will confirm before any escrow action. Drag the slider to compare.
                </p>
                <Button className="mt-auto" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </>
            )}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-5 rounded-xl border bg-card p-6">
          <Field data-invalid={!meterValid}>
            <FieldLabel htmlFor="final-meter">Final hour meter</FieldLabel>
            <Input
              id="final-meter"
              inputMode="decimal"
              value={meter}
              onChange={(e) => setMeter(e.target.value)}
              aria-invalid={!meterValid}
              className="h-11 text-lg tabular-nums"
            />
            <FieldDescription>Check-in reading: 1,420.50 hrs · Session usage: {meterValid ? (Number(meter) - 1420.5).toFixed(2) : '—'} hrs</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="note">Note for facility manager (optional)</FieldLabel>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Clip was already loose when mounting the stub."
              className="min-h-20"
            />
          </Field>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)} disabled={!sessionActive}>
              Back
            </Button>
            <Button onClick={submit} disabled={!meterValid || !sessionActive}>
              Submit return & release custody
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

function Telemetry({
  icon: Icon,
  label,
  value,
  unit,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  unit: string
  ok?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <span className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {label}
        </span>
        {ok && <span className="size-1.5 rounded-full bg-success" aria-label="Nominal" />}
      </span>
      <span className="text-lg font-semibold tabular-nums">
        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  )
}

function LogRow({ time, text }: { time: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="w-12 shrink-0 text-muted-foreground tabular-nums">{time}</span>
      <span className="text-foreground/85">{text}</span>
    </li>
  )
}

function InspectionRow({ angle, result, tone }: { angle: string; result: string; tone: 'success' | 'warning' }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-muted-foreground">{angle}</span>
      <span className={tone === 'warning' ? 'font-medium text-warning' : 'text-success'}>{result}</span>
    </li>
  )
}
