'use client'

import { useState } from 'react'
import { CircleAlert, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppState } from '@/components/app-state'
import { CertificateScanner } from './certificate-scanner'
import { CREDENTIAL_DEFS, type Instrument } from '@/lib/unicore-data'

export function PrerequisiteDialog({
  instrument,
  open,
  onOpenChange,
}: {
  instrument: Instrument
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { heldCredentialIds, addCredential } = useAppState()
  const missing = instrument.prerequisites.filter((p) => !heldCredentialIds.has(p))
  const [target, setTarget] = useState<string | null>(null)
  const active = target && missing.includes(target) ? target : missing[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve prerequisites</DialogTitle>
          <DialogDescription>
            {instrument.shortName} requires the following credentials before a slot can be requested.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col divide-y rounded-lg border">
          {instrument.prerequisites.map((p) => {
            const held = heldCredentialIds.has(p)
            return (
              <li key={p}>
                <button
                  type="button"
                  disabled={held}
                  onClick={() => setTarget(p)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors enabled:hover:bg-accent disabled:cursor-default data-[active=true]:bg-accent"
                  data-active={!held && active === p}
                >
                  {held ? (
                    <CheckCircle2 className="size-4 text-success" aria-hidden />
                  ) : (
                    <CircleAlert className="size-4 text-destructive" aria-hidden />
                  )}
                  <span className="flex-1">{CREDENTIAL_DEFS[p]?.name}</span>
                  <span className={held ? 'text-xs text-success' : 'text-xs text-destructive'}>
                    {held ? 'Verified' : 'Missing'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {active ? (
          <CertificateScanner
            key={active}
            compact
            targetCredentialId={active}
            onConfirm={(c) => {
              addCredential(c)
              toast.success(`${c.title} verified`, { description: 'Added to your Researcher Passport.' })
              if (missing.length <= 1) onOpenChange(false)
            }}
          />
        ) : (
          <p className="text-sm text-success">All prerequisites verified. You can now request a slot.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
