import { createClient } from './client'
import { Booking, Credential, LedgerEvent } from '@/lib/unicore-data'

/**
 * Checks if live Supabase environment variables are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && !!key && !url.includes('demo-unicore')
}

/**
 * Sync a newly created booking with Supabase if online.
 */
export async function syncBookingToSupabase(booking: Booking): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').upsert({
      id: booking.id,
      equipment_id: booking.instrumentId,
      date_label: booking.date,
      slot_label: booking.slot,
      status: booking.status,
      credits: booking.credits,
      purpose_statement: booking.note || 'User scheduled research slot',
      slot_start: new Date().toISOString(),
      slot_end: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    })

    if (error) {
      console.warn('Supabase booking sync warning:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Supabase offline or unreachable:', err)
    return false
  }
}

/**
 * Sync a newly verified credential into Supabase if online.
 */
export async function syncCredentialToSupabase(credential: Credential): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const supabase = createClient()
    const { error } = await supabase.from('user_credentials').upsert({
      credential_id: credential.id,
      title: credential.title,
      authority: credential.authority,
      issued_date: new Date().toISOString().split('T')[0],
      sha_hash: credential.hash,
      status: 'VERIFIED',
    })

    if (error) {
      console.warn('Supabase credential sync warning:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Supabase offline:', err)
    return false
  }
}

/**
 * Append an immutable event block to the Supabase audit ledger.
 */
export async function recordLedgerEventToSupabase(event: LedgerEvent): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  try {
    const supabase = createClient()
    const randomBlock = Math.random().toString(16).slice(2, 10)
    const { error } = await supabase.from('audit_ledger').insert({
      event_type: event.type,
      actor: event.actor,
      lines: event.lines,
      tone: event.tone,
      prev_hash: '0x9f2e71c4ca',
      block_hash: `0x${randomBlock}`,
    })

    if (error) {
      console.warn('Supabase ledger sync warning:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Supabase offline:', err)
    return false
  }
}
