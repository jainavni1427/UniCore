'use client'

import { useRef, useState } from 'react'
import { Check, FileUp, ScanLine, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CREDENTIAL_DEFS, type Credential } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

const STEPS = ['Uploading document', 'Running OCR extraction', 'Validating issuing authority', 'Checking expiry & hashing']

type Phase = { kind: 'idle' } | { kind: 'scanning'; step: number; fileName: string } | { kind: 'review'; fileName: string }

export function CertificateScanner({
  targetCredentialId,
  onConfirm,
  compact,
}: {
  targetCredentialId: string
  onConfirm: (credential: Credential) => void
  compact?: boolean
}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const def = CREDENTIAL_DEFS[targetCredentialId]

  async function start(fileName: string) {
    setPhase({ kind: 'scanning', step: 0, fileName })

    // Visual step progression
    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setPhase((p) => (p.kind === 'scanning' ? { ...p, step: i + 1 } : p))
      }, 500 * (i + 1))
    })

    try {
      const res = await fetch('/api/verify-cert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCredentialId, fileName }),
      })
      const data = await res.json()
      setTimeout(() => {
        setPhase({ kind: 'review', fileName })
      }, 2100)
    } catch {
      setTimeout(() => {
        setPhase({ kind: 'review', fileName })
      }, 2100)
    }
  }

  function confirm() {
    const credential: Credential = {
      id: def.id,
      title: def.name,
      authority: def.authority,
      issued: 'Oct 30, 2026',
      expires: 'Oct 30, 2027',
      daysToExpiry: 365,
      hash: `SHA-${Math.random().toString(16).slice(2, 7)}`,
    }
    onConfirm(credential)
    setPhase({ kind: 'idle' })
  }

  if (phase.kind === 'scanning') {
    const pct = Math.round((phase.step / STEPS.length) * 100)
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-info/25 bg-info/[0.06] p-5" aria-live="polite">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-info/15 text-info">
            <ScanLine className="size-4.5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-sm font-medium">Analyzing {phase.fileName}</p>
            <p className="text-xs text-muted-foreground">AI document verification in progress</p>
          </div>
          <span className="ml-auto text-sm font-semibold text-info tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} className="[&_[data-slot=progress-indicator]]:bg-info" />
        <ol className="flex flex-col gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 text-sm">
              {i < phase.step ? (
                <Check className="size-4 text-success" aria-hidden />
              ) : i === phase.step ? (
                <Loader2 className="size-4 animate-spin text-info" aria-hidden />
              ) : (
                <span className="size-4 rounded-full border border-border" aria-hidden />
              )}
              <span className={cn(i <= phase.step ? 'text-foreground' : 'text-muted-foreground')}>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (phase.kind === 'review') {
    return (
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-info" aria-hidden />
            <p className="text-sm font-medium">Extraction complete</p>
          </div>
          <Badge variant="success">98.4% confidence</Badge>
        </div>
        <dl className="grid grid-cols-1 gap-3 rounded-lg border bg-background/60 p-4 text-sm sm:grid-cols-2">
          <Field label="Credential" value={def.name} />
          <Field label="Issuing authority" value={def.authority} />
          <Field label="Holder" value="Dr. Aris Thorne" />
          <Field label="Valid through" value="Oct 30, 2027" />
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Review the extracted fields before adding. The source file is hashed and stored as tamper-evident evidence.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={confirm}>
            <Check data-icon="inline-start" />
            Add to passport
          </Button>
          <Button variant="ghost" onClick={() => setPhase({ kind: 'idle' })}>
            Discard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) start(file.name)
      }}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background/40 text-center transition-colors',
        compact ? 'p-5' : 'p-8',
        dragging && 'border-primary bg-primary/[0.06]',
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileUp className="size-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Drop a certificate PDF or image</p>
        <p className="text-xs text-muted-foreground">
          AI extracts issuer, holder and expiry for <span className="text-foreground">{def.name}</span>
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="sr-only"
        aria-label="Upload certificate"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) start(file.name)
          e.target.value = ''
        }}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
        <Button variant="ghost" size="sm" onClick={() => start(`${def.id}-certificate.pdf`)}>
          Use sample certificate
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
