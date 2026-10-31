import { notFound } from 'next/navigation'
import { getBooking, getInstrument } from '@/lib/unicore-data'
import { ReturnFlow } from '@/components/bookings/return-flow'

export const metadata = { title: 'Session & Return — UniCore' }

export default async function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = getBooking(id)
  const instrument = booking && getInstrument(booking.instrumentId)
  if (!booking || !instrument) notFound()
  return <ReturnFlow booking={booking} instrument={instrument} />
}
