import { notFound } from 'next/navigation'
import { getBooking, getInstrument } from '@/lib/unicore-data'
import { CheckinFlow } from '@/components/bookings/checkin-flow'

export const metadata = { title: 'Check in — UniCore' }

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = getBooking(id)
  const instrument = booking && getInstrument(booking.instrumentId)
  if (!booking || !instrument) notFound()
  return <CheckinFlow booking={booking} instrument={instrument} />
}
