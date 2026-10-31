import type { Metadata } from 'next'
import { BookingsView } from '@/components/bookings/bookings-view'

export const metadata: Metadata = { title: 'Custody & Bookings — UniCore' }

export default function BookingsPage() {
  return <BookingsView />
}
