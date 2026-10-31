'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, MapPin, QrCode, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { useAppState } from '@/components/app-state'
import { CAPTURE_ANGLES, type Booking, type Instrument } from '@/lib/unicore-data'
import { Stepper } from './stepper'
import { PhotoCapture } from './photo-capture'

const STEPS = ['Scan machine QR', 'Baseline evidence', 'Meter reading']

export function CheckinFlow({ booking, instrument }: { booking: Booking; instrument: Instrument }) {
  const router = useRouter()
  const { setBookingStatus, pushNotification } = useAppState()
  const [step, setStep] = useState(0)
  const [scan, setScan] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [captured, setCaptured] = useState<string[]>([])
  const [meter, setMeter] = useState('')
  const meterValid = /^\d{1,5}(\.\d{1,2})?$/.test(meter.replace(/,/g, ''))

  function runScan() {
    setScan('scanning')
    setTimeout(() => setScan('done'), 1400)
  }

  function finish() {
    setBookingStatus(booking.id, 'active')
    pushNotification({
      tone: 'success',
      title: 'Custody started',
      body: `${instrument.shortName} checked in with 3 baseline photos and meter ${meter} hrs.`,
    })
    toast.success('Check-in complete', { description: 'Custody transferred. Session timer is running.' })
    router.push('/bookings')
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/bookings" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to bookings
      </Link>

      <header className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">
          {booking.id} · {booking.date} · {booking.slot}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Check in to {instrument.shortName}</h1>
        <p className="text-sm text-muted-foreground">
          Custody begins only after the machine is authenticated and baseline condition is recorded.
        </p>
      </header>

      <Stepper steps={STEPS} current={step} />

      <section className="flex flex-col gap-5 rounded-xl border bg-card p-6">
        {step === 0 && (
          <>
            <div className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border bg-background">
              <span className="absolute top-3 left-3 size-6 rounded-tl-lg border-t-2 border-l-2 border-primary" aria-hidden />
              <span className="absolute top-3 right-3 size-6 rounded-tr-lg border-t-2 border-r-2 border-primary" aria-hidden />
              <span className="absolute bottom-3 left-3 size-6 rounded-bl-lg border-b-2 border-l-2 border-primary" aria-hidden />
              <span className="absolute right-3 bottom-3 size-6 rounded-br-lg border-r-2 border-b-2 border-primary" aria-hidden />
              {scan === 'scanning' && (
                <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-primary shadow-[0_0_16px_var(--primary)]" aria-hidden />
              )}
              {scan === 'done' ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ShieldCheck className="size-10 text-success" aria-hidden />
                  <p className="text-sm font-medium">Unit {instrument.unitId} verified</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" aria-hidden /> 19.1334, 72.9133 · within facility geofence
                  </p>
                </div>
              ) : (
                <QrCode className="size-16 text-muted-foreground/50" aria-hidden />
              )}
            </div>
            <p className="text-center text-sm text-muted-foreground" aria-live="polite">
              {scan === 'idle' && 'Point your camera at the QR plate on the instrument housing.'}
              {scan === 'scanning' && 'Authenticating unit and verifying location…'}
              {scan === 'done' && 'Machine identity and location confirmed.'}
            </p>
            <div className="flex justify-center">
              {scan === 'done' ? (
                <Button onClick={() => setStep(1)}>
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button onClick={runScan} disabled={scan === 'scanning'}>
                  {scan === 'scanning' ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <QrCode data-icon="inline-start" />}
                  {scan === 'scanning' ? 'Scanning' : 'Start scan'}
                </Button>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold">Record baseline condition</h2>
              <p className="text-sm text-muted-foreground">
                Capture all {CAPTURE_ANGLES.length} angles. These become the reference for AI damage comparison at return.
              </p>
            </div>
            <PhotoCapture captured={captured} onCapture={setCaptured} image="/inspection/stage-baseline.jpg" />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={captured.length < CAPTURE_ANGLES.length}>
                Continue ({captured.length}/{CAPTURE_ANGLES.length})
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Field data-invalid={meter.length > 0 && !meterValid}>
              <FieldLabel htmlFor="meter">Hour meter reading</FieldLabel>
              <Input
                id="meter"
                inputMode="decimal"
                value={meter}
                onChange={(e) => setMeter(e.target.value)}
                placeholder="e.g. 1420.50"
                aria-invalid={meter.length > 0 && !meterValid}
                className="h-11 text-lg tabular-nums"
              />
              <FieldDescription>
                Last recorded: {instrument.telemetry.filamentHours.toLocaleString()} hrs. Enter the value shown on the instrument panel.
              </FieldDescription>
            </Field>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={finish} disabled={!meterValid}>
                <ShieldCheck data-icon="inline-start" />
                Confirm & start custody
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
