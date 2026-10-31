'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info, Lock, Send, TriangleAlert, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { useAppState } from '@/components/app-state'
import { EligibilityBadge, SectionLabel } from '@/components/unicore/status'
import { PrerequisiteDialog } from '@/components/unicore/prerequisite-dialog'
import {
  CREDENTIAL_DEFS,
  GROUP_USAGE,
  PRICE_FACTOR,
  SLOTS,
  SLOT_DATES,
  WEEKLY_QUOTA,
  computeFairness,
  getEligibility,
  type Instrument,
} from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

const tierLabel = { peak: 'Peak', standard: 'Standard', 'off-peak': 'Off-peak' }
const tierVariant = { peak: 'danger', standard: 'warning', 'off-peak': 'success' } as const

export function BookingPanel({ instrument }: { instrument: Instrument }) {
  const router = useRouter()
  const { heldCredentialIds, addBooking, addRequest, persona, pushNotification } = useAppState()
  const eligibility = getEligibility(instrument, heldCredentialIds)

  const [date, setDate] = useState(SLOT_DATES[0])
  const [slotId, setSlotId] = useState('20-23')
  const [urgent, setUrgent] = useState(false)
  const [declaration, setDeclaration] = useState('')
  const [pledges, setPledges] = useState<string[]>([])
  const [supervisionAck, setSupervisionAck] = useState(false)
  const [prereqOpen, setPrereqOpen] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const slot = SLOTS.find((s) => s.id === slotId) ?? SLOTS[0]
  const fairness = computeFairness(slot, urgent)
  const hours = 3
  const credits = Math.round(hours * instrument.creditsPerHour * PRICE_FACTOR[slot.tier])
  const dollars = Math.round(credits * (instrument.ratePerHour / instrument.creditsPerHour))
  const quotaImpact = hours * slot.multiplier
  const quotaAfter = GROUP_USAGE + quotaImpact
  const overQuota = quotaAfter > WEEKLY_QUOTA

  const declarationValid = declaration.trim().length >= 12
  const pledgesValid = pledges.length === instrument.pledges.length
  const supervisionValid = eligibility.status !== 'conditional' || supervisionAck
  const canSubmit = declarationValid && pledgesValid && supervisionValid && !overQuota

  if (eligibility.status === 'missing') {
    return (
      <PanelShell>
        <div className="flex flex-col gap-4 p-5">
          <EligibilityBadge eligibility={eligibility} className="self-start" />
          <div className="flex flex-col gap-1.5">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4 text-muted-foreground" aria-hidden />
              Booking is locked until prerequisites are verified
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Upload the missing certificate and our AI verifies it in seconds. No back-and-forth with the facility.
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {eligibility.missing.map((m) => (
              <li key={m} className="flex items-center gap-2 rounded-md bg-destructive/[0.07] px-3 py-2 text-sm text-destructive">
                <TriangleAlert className="size-3.5" aria-hidden />
                {CREDENTIAL_DEFS[m]?.name}
              </li>
            ))}
          </ul>
          <Button onClick={() => setPrereqOpen(true)}>Resolve prerequisite</Button>
        </div>
        <PrerequisiteDialog instrument={instrument} open={prereqOpen} onOpenChange={setPrereqOpen} />
      </PanelShell>
    )
  }

  function submit() {
    setAttempted(true)
    if (!canSubmit) return
    const id = `BK-${9070 + Math.floor(Math.random() * 20)}`
    addBooking({
      id,
      instrumentId: instrument.id,
      date,
      slot: slot.label,
      status: 'pending',
      credits,
      note: 'Awaiting facility approval',
    })
    addRequest({
      id,
      instrumentId: instrument.id,
      slot: `${date} ${slot.label}`,
      applicant: persona.id === 'researcher' ? 'Dr. Aris Thorne' : persona.name,
      applicantType: 'External Startup Founder',
      prerequisites: instrument.prerequisites.map((p) => ({ label: `${CREDENTIAL_DEFS[p]?.name} Verified`, ok: true })),
      statement: declaration.trim(),
      fairness: fairness.score,
    })
    pushNotification({
      tone: 'info',
      title: 'Request submitted',
      body: `${instrument.shortName}, ${date} ${slot.label}. Fairness forecast ${fairness.score}/100.`,
      action: { label: 'Track request', href: '/bookings' },
    })
    toast.success('Allocation request submitted', {
      description: `${id} is now in the facility queue. You will be notified on decision.`,
    })
    router.push('/bookings')
  }

  return (
    <PanelShell>
      <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">Request a slot</h2>
          <p className="text-xs text-muted-foreground">3-hour blocks · {instrument.peakBufferMins} min buffer enforced</p>
        </div>
        <EligibilityBadge eligibility={eligibility} />
      </div>

      <div className="flex flex-col gap-5 p-5">
        <FieldSet>
          <FieldLegend variant="label">Date</FieldLegend>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={1}
            value={[date]}
            onValueChange={(v) => v[0] && setDate(v[0])}
            className="w-full flex-wrap"
            aria-label="Select date"
          >
            {SLOT_DATES.map((d) => (
              <ToggleGroupItem key={d} value={d} className="flex-1 px-2 text-xs">
                {d.replace(', ', ' ')}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Time slot</FieldLegend>
          <RadioGroup value={slotId} onValueChange={(v) => setSlotId(v as string)} className="gap-2" aria-label="Time slot">
            {SLOTS.map((s) => (
              <FieldLabel
                key={s.id}
                htmlFor={`slot-${s.id}`}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 font-normal transition-colors hover:bg-accent/60',
                  slotId === s.id && 'border-primary/50 bg-primary/[0.06]',
                )}
              >
                <RadioGroupItem id={`slot-${s.id}`} value={s.id} />
                <span className="flex-1 text-sm font-medium tabular-nums">{s.label}</span>
                {s.competing > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" aria-hidden />
                    {s.competing}
                  </span>
                )}
                <Badge variant={tierVariant[s.tier]}>
                  {tierLabel[s.tier]} · {s.multiplier}x
                </Badge>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldDescription>Multiplier is applied to your group&apos;s weekly quota, not your bill.</FieldDescription>
        </FieldSet>

        <Field orientation="horizontal">
          <Checkbox id="urgent" checked={urgent} onCheckedChange={(v) => setUrgent(Boolean(v))} />
          <FieldLabel htmlFor="urgent" className="font-normal">
            Grant or publication deadline within 14 days
          </FieldLabel>
        </Field>

        <FairnessForecast fairness={fairness} competing={slot.competing} urgent={urgent} />

        <Separator />

        <FieldGroup className="gap-4">
          <Field data-invalid={attempted && !declarationValid}>
            <FieldLabel htmlFor="declaration">Specimen declaration</FieldLabel>
            <Textarea
              id="declaration"
              value={declaration}
              onChange={(e) => setDeclaration(e.target.value)}
              placeholder="e.g. CVD-grown MoS₂ monolayers on SiO₂/Si, 10 × 10 mm"
              aria-invalid={attempted && !declarationValid}
              className="min-h-20"
            />
            {attempted && !declarationValid && <FieldDescription>Describe your specimen in at least a short sentence.</FieldDescription>}
          </Field>

          <FieldSet data-invalid={attempted && !pledgesValid}>
            <FieldLegend variant="label">Safety pledges</FieldLegend>
            <FieldGroup className="gap-2.5">
              {instrument.pledges.map((p, i) => (
                <Field key={p} orientation="horizontal">
                  <Checkbox
                    id={`pledge-${i}`}
                    checked={pledges.includes(p)}
                    aria-invalid={attempted && !pledges.includes(p)}
                    onCheckedChange={(v) => setPledges((prev) => (v ? [...prev, p] : prev.filter((x) => x !== p)))}
                  />
                  <FieldLabel htmlFor={`pledge-${i}`} className="font-normal leading-snug">
                    {p}
                  </FieldLabel>
                </Field>
              ))}
              {eligibility.status === 'conditional' && (
                <Field orientation="horizontal">
                  <Checkbox
                    id="supervision"
                    checked={supervisionAck}
                    aria-invalid={attempted && !supervisionAck}
                    onCheckedChange={(v) => setSupervisionAck(Boolean(v))}
                  />
                  <FieldLabel htmlFor="supervision" className="font-normal leading-snug text-warning">
                    I accept a facility supervisor will be present for this session
                  </FieldLabel>
                </Field>
              )}
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-3 border-t bg-background/40 px-5 py-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Estimated charge</dt>
            <dd className="font-semibold tabular-nums">
              {credits} credits <span className="font-normal text-muted-foreground">(${dollars})</span>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Quota after booking</dt>
            <dd className={cn('font-semibold tabular-nums', overQuota ? 'text-destructive' : 'text-foreground')}>
              {quotaAfter} / {WEEKLY_QUOTA} hrs
            </dd>
          </div>
        </dl>
        {overQuota && (
          <p className="flex items-start gap-2 text-xs text-destructive">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            This slot would exceed your group&apos;s weekly quota. Choose an off-peak slot.
          </p>
        )}
        <Button size="lg" className="h-10 w-full" onClick={submit} disabled={overQuota}>
          <Send data-icon="inline-start" />
          Submit allocation request
        </Button>
        <p className="text-center text-xs text-muted-foreground">Cancellation: 12-hr notice or 50% escrow</p>
      </div>
    </PanelShell>
  )
}

function PanelShell({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col overflow-hidden rounded-xl border bg-card" aria-label="Booking">{children}</section>
}

function FairnessForecast({
  fairness,
  competing,
  urgent,
}: {
  fairness: ReturnType<typeof computeFairness>
  competing: number
  urgent: boolean
}) {
  const tone = fairness.score >= 80 ? 'text-success' : fairness.score >= 60 ? 'text-warning' : 'text-destructive'
  const bar =
    fairness.score >= 80
      ? '[&_[data-slot=progress-indicator]]:bg-success'
      : fairness.score >= 60
        ? '[&_[data-slot=progress-indicator]]:bg-warning'
        : '[&_[data-slot=progress-indicator]]:bg-destructive'

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background/50 p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <SectionLabel>Fairness forecast</SectionLabel>
        <span className={cn('text-sm font-semibold tabular-nums', tone)}>
          {fairness.score}/100 · {fairness.band}
        </span>
      </div>
      <Progress value={fairness.score} className={cn('[&_[data-slot=progress-track]]:h-1.5', bar)}>
        <span className="sr-only">Fairness score {fairness.score} out of 100</span>
      </Progress>
      <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
        <li className="flex justify-between gap-2">
          <span>
            Group usage this week: {GROUP_USAGE}/{WEEKLY_QUOTA} hrs
          </span>
          <span className="text-success tabular-nums">+{fairness.lowUsageBoost}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Deadline urgency</span>
          <span className={cn('tabular-nums', urgent ? 'text-success' : '')}>{urgent ? '+10' : '0'}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Off-peak contribution</span>
          <span className={cn('tabular-nums', fairness.offPeakBonus ? 'text-success' : '')}>+{fairness.offPeakBonus}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Competing requests for slot: {competing}</span>
          <span className={cn('tabular-nums', competing ? 'text-destructive' : '')}>
            {competing ? `−${fairness.competitionPenalty}` : '0'}
          </span>
        </li>
      </ul>
      <p className="flex items-start gap-2 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
        {competing > 0
          ? 'Another group requested this slot. Requests are ranked by quota usage first — an off-peak slot is likely to be approved faster.'
          : 'No competing requests. Based on your low quota usage, this request is likely to be approved.'}
      </p>
    </div>
  )
}
