import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { INSTRUMENTS, getInstrument } from '@/lib/unicore-data'
import { InstrumentDetail } from '@/components/explore/instrument-detail'

export function generateStaticParams() {
  return INSTRUMENTS.map((i) => ({ id: i.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const instrument = getInstrument(id)
  return { title: instrument ? `${instrument.shortName} — UniCore` : 'Instrument — UniCore' }
}

export default async function InstrumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const instrument = getInstrument(id)
  if (!instrument) notFound()
  return <InstrumentDetail instrument={instrument} />
}
