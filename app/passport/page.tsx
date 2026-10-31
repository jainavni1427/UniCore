import type { Metadata } from 'next'
import { PassportView } from '@/components/passport/passport-view'

export const metadata: Metadata = { title: 'Researcher Passport — UniCore' }

export default function PassportPage() {
  return <PassportView />
}
