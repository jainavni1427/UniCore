'use client'

import Link from 'next/link'
import { ArrowRight, QrCode, Receipt, CalendarDays, Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppState } from '@/components/app-state'
import { Countdown, SectionLabel, Stat } from '@/components/unicore/status'
import { GROUP_USAGE, WEEKLY_QUOTA, getInstrument, type Booking, type BookingStatus } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

const statusMeta: Record<BookingStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'secondary' | 'danger' }> = {
  active: { label: 'In custody', variant: 'success' },
  approved: { label: 'Approved', variant: 'info' },
  pending: { label: 'Pending approval', variant: 'warning' },
  waitlisted: { label: 'Waitlisted', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'secondary' },
}

export function BookingsView() {
  const { bookings, sessionActive, sessionEndsAt } = useAppState()
  const active = bookings.filter((b) => b.status === 'active')
  const upcoming = bookings.filter((b) => ['approved', 'pending', 'waitlisted'].includes(b.status))
  const past = bookings.filter((b) => b.status === 'completed')
  const credits = bookings.filter((b) => b.status !== 'completed').reduce((s, b) => s + b.credits, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Custody & Bookings</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every session is bound by a verified check-in and return. Evidence is hashed into a tamper-evident ledger.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 md:grid-cols-4" aria-label="Summary">
        <Stat label="Active sessions" value={active.length} tone={active.length ? 'success' : undefined} />
        <Stat label="Upcoming" value={upcoming.length} />
        <Stat label="Credits committed" value={credits} />
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Group quota this week</span>
          <span className="text-lg font-semibold tabular-nums">
            {GROUP_USAGE} <span className="text-sm font-normal text-muted-foreground">/ {WEEKLY_QUOTA} hrs</span>
          </span>
          <Progress value={(GROUP_USAGE / WEEKLY_QUOTA) * 100} />
        </div>
      </section>

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionLabel>Active custody</SectionLabel>
          {active.map((b) => {
            const inst = getInstrument(b.instrumentId)
            return (
              <div
                key={b.id}
                className="flex flex-col gap-4 rounded-xl border border-success/25 bg-success/[0.05] p-5 md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">In custody</Badge>
                    <span className="text-xs text-muted-foreground">{b.id}</span>
                  </div>
                  <p className="font-semibold">{inst?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.date} · {b.slot} · {inst?.facility}
                  </p>
                </div>
                <div className="flex flex-col gap-0.5 md:items-end">
                  <span className="text-xs text-muted-foreground">Time remaining</span>
                  {sessionActive ? (
                    <Countdown endsAt={sessionEndsAt} className="text-xl font-semibold text-success" />
                  ) : (
                    <span className="text-xl font-semibold">Returned</span>
                  )}
                </div>
                <Link
                  href={`/bookings/${b.id}/return`}
                  className={cn(buttonVariants(), 'gap-1.5')}
                >
                  Session HUD & return
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            )
          })}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionLabel>Upcoming</SectionLabel>
        <BookingTable bookings={upcoming} empty="No upcoming bookings. Explore the marketplace to request a slot." />
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>History</SectionLabel>
        <BookingTable bookings={past} empty="No completed sessions yet." />
      </section>
    </div>
  )
}

function BookingTable({ bookings, empty }: { bookings: Booking[]; empty: string }) {
  if (bookings.length === 0) {
    return <p className="rounded-xl border border-dashed px-5 py-8 text-center text-sm text-muted-foreground">{empty}</p>
  }
  return (
    <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card">
      {bookings.map((b) => {
        const inst = getInstrument(b.instrumentId)
        const meta = statusMeta[b.status]
        return (
          <li key={b.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-accent/30 md:flex-row md:items-center md:gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{inst?.shortName}</p>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden /> {b.date}
                </span>
                <span className="flex items-center gap-1.5 tabular-nums">
                  <Clock3 className="size-3.5" aria-hidden /> {b.slot}
                </span>
                <span>{b.id}</span>
              </p>
              {b.note && <p className="text-xs text-muted-foreground">{b.note}</p>}
            </div>
            <span className="text-sm tabular-nums text-muted-foreground md:w-24 md:text-right">{b.credits} credits</span>
            <div className="md:w-40 md:text-right">
              {b.status === 'approved' && (
                <Link
                  href={`/bookings/${b.id}/checkin`}
                  className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'gap-1.5')}
                >
                  <QrCode className="size-3.5" aria-hidden />
                  Check in
                </Link>
              )}
              {b.status === 'completed' && (
                <Link
                  href={`/bookings/${b.id}/receipt`}
                  className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'gap-1.5')}
                >
                  <Receipt className="size-3.5" aria-hidden />
                  Custody receipt
                </Link>
              )}
              {(b.status === 'pending' || b.status === 'waitlisted') && (
                <Link
                  href={`/explore/${b.instrumentId}`}
                  className={buttonVariants({ size: 'sm', variant: 'ghost' })}
                >
                  View instrument
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
