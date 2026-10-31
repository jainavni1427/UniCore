'use client'

import { useState } from 'react'
import { BadgeCheck, Fingerprint, ShieldCheck, TriangleAlert, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldLabel } from '@/components/ui/field'
import { useAppState } from '@/components/app-state'
import { CertificateScanner } from '@/components/unicore/certificate-scanner'
import { SectionLabel, Stat } from '@/components/unicore/status'
import { CREDENTIAL_DEFS, INSTRUMENTS, getEligibility, type Credential } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

export function PassportView() {
  const { credentials, heldCredentialIds, addCredential } = useAppState()
  const missingDefs = Object.values(CREDENTIAL_DEFS).filter((d) => !heldCredentialIds.has(d.id))
  const [target, setTarget] = useState<string | null>(missingDefs[0]?.id ?? null)
  const activeTarget = target && !heldCredentialIds.has(target) ? target : missingDefs[0]?.id

  const expiring = credentials.filter((c) => c.daysToExpiry !== null && c.daysToExpiry <= 30).length
  const unlocked = INSTRUMENTS.filter((i) => getEligibility(i, heldCredentialIds).status !== 'missing').length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Researcher Passport</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A portable, verifiable credential wallet accepted across every UniCore member institution.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-xl border bg-card p-6">
          <div
            className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div className="flex items-start gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-base font-semibold">AT</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Dr. Aris Thorne</h2>
                <Badge variant="success">
                  <BadgeCheck data-icon="inline-start" />
                  Identity verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">External Startup Founder · Nanoforge Materials Pvt. Ltd.</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden /> Affiliated via IIT Bombay SINE Incubator
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4">
            <Stat label="Passport ID" value="UC-882-4410" />
            <Stat label="Credentials" value={credentials.length} />
            <Stat label="Instruments unlocked" value={`${unlocked}/${INSTRUMENTS.length}`} tone="success" />
            <Stat label="Expiring ≤ 30 days" value={expiring} tone={expiring ? 'warning' : undefined} />
          </dl>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Fingerprint className="size-3.5" aria-hidden />
            Every credential is hashed on upload. Facility managers see verification, not your raw documents.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">Add a credential</h2>
            <p className="text-sm text-muted-foreground">Upload a certificate and AI extracts and verifies it instantly.</p>
          </div>
          {activeTarget ? (
            <>
              <Field>
                <FieldLabel htmlFor="target-cred" className="text-xs text-muted-foreground">
                  Credential type
                </FieldLabel>
                <Select
                  items={missingDefs.map((d) => ({ label: d.name, value: d.id }))}
                  value={activeTarget}
                  onValueChange={(v) => setTarget(v as string)}
                >
                  <SelectTrigger id="target-cred" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {missingDefs.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <CertificateScanner
                key={activeTarget}
                compact
                targetCredentialId={activeTarget}
                onConfirm={(c) => {
                  addCredential(c)
                  toast.success(`${c.title} verified`, { description: 'New instruments may now be unlocked.' })
                }}
              />
            </>
          ) : (
            <p className="text-sm text-success">Every credential type in the consortium is verified on your passport.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="creds-heading">
        <div className="flex items-center justify-between">
          <SectionLabel>
            <span id="creds-heading">Verified credentials</span>
          </SectionLabel>
          <span className="text-xs text-muted-foreground">{credentials.length} on file</span>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {credentials.map((c) => (
            <CredentialCard key={c.id} credential={c} />
          ))}
        </ul>
      </section>
    </div>
  )
}

function CredentialCard({ credential: c }: { credential: Credential }) {
  const expiringSoon = c.daysToExpiry !== null && c.daysToExpiry <= 30
  return (
    <li
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/15',
        expiringSoon && 'border-warning/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            expiringSoon ? 'bg-warning/15 text-warning' : 'bg-success/12 text-success',
          )}
        >
          {expiringSoon ? <TriangleAlert className="size-4" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
        </span>
        {expiringSoon ? (
          <Badge variant="warning">Expires in {c.daysToExpiry} days</Badge>
        ) : c.expires ? (
          <Badge variant="success">Valid</Badge>
        ) : (
          <Badge variant="secondary">No expiry</Badge>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm leading-snug font-semibold">
          {c.title}
          {c.level && <span className="font-normal text-muted-foreground"> · {c.level}</span>}
        </h3>
        <p className="text-xs text-muted-foreground">{c.authority}</p>
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-2 border-t pt-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Issued</dt>
          <dd className="font-medium">{c.issued}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Expires</dt>
          <dd className={cn('font-medium', expiringSoon && 'text-warning')}>{c.expires ?? '—'}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">Hash</dt>
          <dd className="truncate font-medium text-muted-foreground">{c.hash}</dd>
        </div>
      </dl>
    </li>
  )
}
