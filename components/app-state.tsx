'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  BOOKINGS,
  INITIAL_CREDENTIALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REQUESTS,
  PERSONAS,
  type ApprovalRequest,
  type Booking,
  type BookingStatus,
  type Credential,
  type Notification,
  type Persona,
  type PersonaId,
} from '@/lib/unicore-data'
import { syncBookingToSupabase, syncCredentialToSupabase } from '@/lib/supabase/sync'

type AppState = {
  persona: Persona
  setPersona: (id: PersonaId) => void
  credentials: Credential[]
  heldCredentialIds: Set<string>
  addCredential: (credential: Credential) => void
  pendingSubmissions: string[]
  notifications: Notification[]
  dismissNotification: (id: string) => void
  clearNotifications: () => void
  pushNotification: (n: Omit<Notification, 'id' | 'time'>) => void
  bookings: Booking[]
  addBooking: (b: Booking) => void
  setBookingStatus: (id: string, status: BookingStatus) => void
  requests: ApprovalRequest[]
  addRequest: (r: ApprovalRequest) => void
  removeRequest: (id: string) => void
  sessionEndsAt: number | null
  sessionActive: boolean
  endSession: () => void
  incidentResolved: boolean
  resolveIncident: () => void
}

const AppStateContext = createContext<AppState | null>(null)

const SESSION_REMAINING_MS = (60 + 14) * 60 * 1000

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [personaId, setPersonaId] = useState<PersonaId>('researcher')
  const [credentials, setCredentials] = useState<Credential[]>(INITIAL_CREDENTIALS)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS)
  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS)
  const [sessionEndsAt, setSessionEndsAt] = useState<number | null>(null)
  const [sessionActive, setSessionActive] = useState(true)
  const [incidentResolved, setIncidentResolved] = useState(false)

  useEffect(() => {
    // Anchored on mount so server and client markup match during hydration.
    setSessionEndsAt(Date.now() + SESSION_REMAINING_MS)
  }, [])

  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]

  const heldCredentialIds = useMemo(() => new Set(credentials.map((c) => c.id)), [credentials])

  const addCredential = useCallback((credential: Credential) => {
    setCredentials((prev) => (prev.some((c) => c.id === credential.id) ? prev : [credential, ...prev]))
    syncCredentialToSupabase(credential).catch(() => {})
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const pushNotification = useCallback((n: Omit<Notification, 'id' | 'time'>) => {
    setNotifications((prev) => [{ ...n, id: crypto.randomUUID(), time: 'Just now' }, ...prev])
  }, [])

  const value: AppState = {
    persona,
    setPersona: setPersonaId,
    credentials,
    heldCredentialIds,
    addCredential,
    pendingSubmissions: ['Cleanroom Class 10,000 Protocol'],
    notifications,
    dismissNotification,
    clearNotifications: () => setNotifications([]),
    pushNotification,
    bookings,
    addBooking: (b) => {
      setBookings((prev) => [b, ...prev])
      syncBookingToSupabase(b).catch(() => {})
    },
    setBookingStatus: (id, status) =>
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b))),
    requests,
    addRequest: (r) => setRequests((prev) => [r, ...prev]),
    removeRequest: (id) => setRequests((prev) => prev.filter((r) => r.id !== id)),
    sessionEndsAt,
    sessionActive,
    endSession: () => setSessionActive(false),
    incidentResolved,
    resolveIncident: () => setIncidentResolved(true),
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
