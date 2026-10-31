import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Fingerprint } from 'lucide-react'
import { getBooking, getInstrument } from '@/lib/unicore-data'
import { CustodyLedger } from '@/components/unicore/custody-ledger'
import { Stat } from '@/components/unicore/status'
import { ReceiptActions } from '@/components/bookings/receipt-actions'

export const metadata = { title: 'Custody Receipt — UniCore' }

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = getBooking(id)
  const instrument = booking && getInstrument(booking.instrumentId)
  if (!booking || !instrument) notFound()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link href="/bookings" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to bookings
      </Link>

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">Custody receipt · {booking.id}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{instrument.name}</h1>
          <p className="text-sm text-muted-foreground">
            {instrument.facility}, {instrument.institution}
          </p>
        </div>
        <ReceiptActions />
      </header>

      <section className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 sm:grid-cols-4">
        <Stat label="Session" value={booking.slot} />
        <Stat label="Meter usage" value="3.02 hrs" />
        <Stat label="Charged" value={`${booking.credits} credits`} />
        <Stat label="Escrow" value="Released" tone="success" />
      </section>

      <section className="flex flex-col gap-5 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Chain of custody</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Fingerprint className="size-3.5" aria-hidden /> Ledger root #9f2e71
          </span>
        </div>
        <CustodyLedger />
      </section>
    </div>
  )
}
