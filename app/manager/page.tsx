'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Flame,
  Gauge,
  History,
  Layers,
  MapPin,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useAppState } from '@/components/app-state'
import { CompareSlider } from '@/components/unicore/compare-slider'
import { SectionLabel, Stat } from '@/components/unicore/status'
import {
  ApprovalRequest,
  CustodyUnit,
  INITIAL_REQUESTS,
  LIVE_CUSTODY,
  getInstrument,
} from '@/lib/unicore-data'

export default function FacilityManagerPage() {
  const {
    requests,
    removeRequest,
    setBookingStatus,
    pushNotification,
    incidentResolved,
    resolveIncident,
  } = useAppState()

  const [activeTab, setActiveTab] = useState<'queue' | 'telemetry' | 'disputes'>('queue')
  const [resolutionNote, setResolutionNote] = useState('')
  const [disputeState, setDisputeState] = useState<'pending' | 'resolved'>(
    incidentResolved ? 'resolved' : 'pending'
  )

  // Handle Approval Action
  function handleApprove(req: ApprovalRequest) {
    removeRequest(req.id)
    setBookingStatus(req.id, 'approved')
    pushNotification({
      tone: 'success',
      title: 'Booking approved by Facility Manager',
      body: `Your request for ${req.slot} has been approved by Prof. Chen. Dynamic QR token issued.`,
      action: { label: 'View in Bookings', href: '/bookings' },
    })
    toast.success(`Booking ${req.id} Approved`, {
      description: `${req.applicant} has been notified and issued a check-in token.`,
    })
  }

  // Handle Waitlist Action
  function handleWaitlist(req: ApprovalRequest) {
    removeRequest(req.id)
    setBookingStatus(req.id, 'waitlisted')
    pushNotification({
      tone: 'warning',
      title: 'Placed on Transparent Waitlist',
      body: `Request ${req.id} placed at Waitlist #1 due to competing quota priority rules.`,
      action: { label: 'View Queue', href: '/bookings' },
    })
    toast.info(`Booking ${req.id} Waitlisted`, {
      description: `Applicant transparently informed of queue position.`,
    })
  }

  // Handle Reject Action
  function handleReject(req: ApprovalRequest) {
    removeRequest(req.id)
    pushNotification({
      tone: 'danger',
      title: 'Booking Request Declined',
      body: `Request ${req.id} could not be accommodated. Reason: Lab capacity constraints.`,
    })
    toast.error(`Booking ${req.id} Declined`)
  }

  // Handle Dispute Resolution
  function handleResolveDispute(actionType: 'clear' | 'refresh' | 'bill') {
    resolveIncident()
    setDisputeState('resolved')

    if (actionType === 'clear') {
      toast.success('Incident Closed: Normal Wear & Tear', {
        description: 'No penalty assessed. Escrow deposit released. Audit ledger updated.',
      })
      pushNotification({
        tone: 'success',
        title: 'Inspection Cleared by Facility Manager',
        body: 'Prof. Chen reviewed the surface mark and deemed it normal wear. Escrow released.',
        action: { label: 'View Receipt', href: '/bookings/BK-9021/receipt' },
      })
    } else if (actionType === 'refresh') {
      toast.warning('Skill Refresh Required', {
        description: 'User must complete 15-min specimen loading refresh before next booking.',
      })
      pushNotification({
        tone: 'warning',
        title: 'Action Required: Skill Refresh',
        body: 'Sample clip alignment protocol required before next session.',
      })
    } else {
      toast.error('Damage Deducted from Grant Escrow', {
        description: '$150 billed to Research Allocation Code for sample clip replacement.',
      })
      pushNotification({
        tone: 'danger',
        title: 'Escrow Deduction Confirmed',
        body: 'Repair cost of $150 deducted for mechanical damage on stage clip.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Facility Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Facility Operations Console</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Prof. Chen · Director
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Central Nanofabrication Core (CRN) · Indian Institute of Technology Bombay
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="gap-1.5 py-1 px-3">
            <ShieldCheck className="size-3.5" /> Core Facility Active
          </Badge>
          <span className="text-xs text-muted-foreground">
            Compliance Score: <strong className="text-foreground">99.4%</strong>
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Pending Approvals" value={requests.length} tone={requests.length > 0 ? 'warning' : 'success'} />
        <Stat label="Active Machines" value="4 / 5" tone="info" />
        <Stat label="Open Anomalies" value={disputeState === 'resolved' ? '0' : '1'} tone={disputeState === 'resolved' ? 'success' : 'danger'} />
        <Stat label="Weekly Facility Revenue" value="340 Credits ($2,720)" tone="success" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="queue" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="queue" className="relative">
            Allocation Queue
            {requests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-warning px-1.5 py-0.2 text-[10px] font-bold text-background">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="telemetry">Live Custody HUD</TabsTrigger>
          <TabsTrigger value="disputes" className="relative">
            Anomaly & Disputes
            {disputeState === 'pending' && (
              <span className="ml-1.5 size-2 rounded-full bg-destructive animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ----------------- TAB 1: ALLOCATION REQUESTS ----------------- */}
        <TabsContent value="queue" className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Pending Booking Requests</h2>
            <p className="text-sm text-muted-foreground">
              UniCore’s Fair Allocation Engine pre-screens eligibility, evaluates weekly group quotas, and explains competition.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              <CheckCircle2 className="mx-auto size-10 text-success/60 mb-3" />
              <p className="font-medium text-foreground">Queue Clear</p>
              <p className="text-sm">All pending booking requests have been processed.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {requests.map((req) => {
                const inst = getInstrument(req.instrumentId)
                return (
                  <Card key={req.id} className="p-6 flex flex-col gap-5 border-border bg-card">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarFallback className="font-bold">
                            {req.applicant.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base">{req.applicant}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {req.applicantType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Request ID: <span className="font-mono">{req.id}</span> · Target: {inst?.shortName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Fairness Index:</span>
                        <Badge
                          variant={req.fairness >= 80 ? 'success' : req.fairness >= 60 ? 'warning' : 'destructive'}
                          className="font-mono text-xs"
                        >
                          {req.fairness}/100
                        </Badge>
                      </div>
                    </div>

                    {/* Slot & Prerequisites */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Requested Slot & Purpose
                        </span>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Clock className="size-4 text-primary" /> {req.slot}
                        </p>
                        <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-lg border">
                          "{req.statement}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Pre-Screened Eligibility Status
                        </span>
                        <ul className="flex flex-col gap-1.5">
                          {req.prerequisites.map((p, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs">
                              {p.ok ? (
                                <CheckCircle2 className="size-4 text-success" />
                              ) : (
                                <XCircle className="size-4 text-destructive" />
                              )}
                              <span className={p.ok ? 'text-foreground' : 'text-destructive font-medium'}>
                                {p.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Explainable Conflict Box */}
                    {req.conflict && (
                      <div className="rounded-xl border border-warning/40 bg-warning/[0.07] p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-warning text-sm font-semibold">
                          <Scale className="size-4" />
                          <span>Explainable Conflict Arbiter</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Competing Request: <strong className="text-foreground">{req.conflict.competitor}</strong>
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="border-warning/60 text-warning">
                            Recommendation: {req.conflict.recommendation}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/90 font-mono mt-1">
                          ↳ Reason: {req.conflict.reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => handleReject(req)}>
                        Decline
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleWaitlist(req)}>
                        Place on Waitlist
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(req)}>
                        <UserCheck data-icon="inline-start" />
                        1-Click Approve Slot
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ----------------- TAB 2: LIVE CUSTODY HUD ----------------- */}
        <TabsContent value="telemetry" className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Active Custody & Machine Telemetry</h2>
            <p className="text-sm text-muted-foreground">
              Real-time monitoring of all facility assets currently unlocked and operating on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIVE_CUSTODY.map((item, idx) => (
              <Card key={idx} className="p-5 flex flex-col gap-4 border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{item.unit}</h3>
                    <p className="text-xs text-muted-foreground">
                      Active Operator: <strong className="text-foreground">{item.operator}</strong> · ({item.booking})
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.state === 'nominal'
                        ? 'success'
                        : item.state === 'overdue'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {item.state === 'nominal' && 'Running Nominally'}
                    {item.state === 'overdue' && 'Overdue by 12m'}
                    {item.state === 'attention' && 'Attention: High Vacuum'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Session Started</span>
                    <span className="font-medium font-mono">{item.started}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Time Left</span>
                    <span
                      className={`font-semibold font-mono ${
                        item.state === 'overdue' ? 'text-destructive' : 'text-success'
                      }`}
                    >
                      {item.remaining}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Filament Meter</span>
                    <span className="font-medium font-mono">{item.filament}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> Geofence: Cleanroom Pod B
                  </span>
                  <Link
                    href={`/bookings/${item.booking}/receipt`}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Live Ledger <ArrowRight className="size-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ----------------- TAB 3: DISPUTE & ANOMALY RESOLUTION ----------------- */}
        <TabsContent value="disputes" className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">AI Condition Inspection & Dispute Desk</h2>
            <p className="text-sm text-muted-foreground">
              Review flagged return condition anomalies using tamper-evident side-by-side visual diffing.
            </p>
          </div>

          <Card className="p-6 border-border bg-card flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Incident Case #INC-9021-SEM</h3>
                  {disputeState === 'resolved' ? (
                    <Badge variant="success">Resolved & Cleared</Badge>
                  ) : (
                    <Badge variant="danger">Dispute Open: AI Surface Anomaly</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Instrument: Zeiss Crossbeam 550 FIB-SEM · Operator: Dr. Aris Thorne (Nanoforge Materials)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Escrow Guarantee Held</span>
                <span className="text-base font-bold font-mono text-emerald-400">$500.00 USD</span>
              </div>
            </div>

            {/* Visual Diff Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Interactive Photographic Comparison (Drag slider to inspect)
                </span>
                <CompareSlider
                  before="/inspection/stage-baseline.jpg"
                  after="/inspection/stage-return.jpg"
                  beforeLabel="Check-In Baseline (14:02)"
                  afterLabel="Return Inspection (17:03)"
                  anomaly={
                    disputeState === 'resolved'
                      ? undefined
                      : { top: '38%', left: '44%', size: '18%', label: 'Scratch · 0.4 mm' }
                  }
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-2.5">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Computer Vision Delta Analysis
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span>Identified Feature:</span>
                    <strong className="text-destructive">Micro-scratch on Sample Clip #2</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>AI Model Confidence:</span>
                    <strong className="font-mono text-foreground">81.4% (New Delta)</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Meter Usage Difference:</span>
                    <strong className="font-mono text-foreground">3.02 operating hours</strong>
                  </div>
                  <div className="border-t pt-2 text-xs text-muted-foreground">
                    Borrower statement: <em>"Sample clip was slightly stiff when mounting the stub."</em>
                  </div>
                </div>

                {disputeState === 'resolved' ? (
                  <div className="rounded-xl border border-success/30 bg-success/[0.05] p-5 text-center flex flex-col items-center gap-2">
                    <CheckCircle2 className="size-8 text-success" />
                    <p className="font-semibold text-sm">Dispute Successfully Resolved</p>
                    <p className="text-xs text-muted-foreground">
                      Action logged: "Normal wear & tear. Maintenance fund cleared. Escrow released."
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Human Manager Mediation Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-success/40 text-success hover:bg-success/10"
                        onClick={() => handleResolveDispute('clear')}
                      >
                        Normal Wear (Release)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-warning/40 text-warning hover:bg-warning/10"
                        onClick={() => handleResolveDispute('refresh')}
                      >
                        Require Re-training
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleResolveDispute('bill')}
                      >
                        Charge $150 Repair
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
