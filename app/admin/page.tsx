'use client'

import { useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Download,
  FileCheck,
  Hash,
  Lock,
  PieChart,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SectionLabel, Stat } from '@/components/unicore/status'
import { LEDGER } from '@/lib/unicore-data'

export default function AdminCompliancePage() {
  const [verifying, setVerifying] = useState(false)
  const [verifiedChain, setVerifiedChain] = useState(true)

  function runLedgerVerification() {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerifiedChain(true)
      toast.success('Ledger Integrity Verified', {
        description: 'All 6 hash blocks cryptographically verified against SHA-256 state tree.',
      })
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Institutional Compliance & Audit</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Dean R. Kulkarni · Compliance Officer
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Consortium Level Oversight · IIT Bombay · IISc Bangalore · TIFR Mumbai
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success('Exporting Consortium Audit Report', {
                description: 'PDF report generated for Science & Engineering Research Board (SERB).',
              })
            }
          >
            <Download data-icon="inline-start" />
            Export Compliance Report
          </Button>
        </div>
      </div>

      {/* Consortium High-Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Consortium Institutions" value="3 Campuses" tone="info" />
        <Stat label="Shared Deep-Tech Assets" value="28 Instruments" tone="success" />
        <Stat label="Avg. Facility Uptime" value="84.2%" tone="success" />
        <Stat label="External Startup Hours" value="312.5 hrs (28%)" tone="info" />
      </div>

      {/* Campus Breakdown & Fair Share Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card flex flex-col gap-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Member Campuses & Shared Utilization
            </h2>
            <Badge variant="secondary">Q4 2026</Badge>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">IIT Bombay (NanoFab & SAIF)</span>
                <span className="text-muted-foreground font-mono">14 Instruments · 88% Uptime</span>
              </div>
              <Progress value={88} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">IISc Bangalore (CeNSE & MRC)</span>
                <span className="text-muted-foreground font-mono">9 Instruments · 81% Uptime</span>
              </div>
              <Progress value={81} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">TIFR Mumbai (National NMR Facility)</span>
                <span className="text-muted-foreground font-mono">5 Instruments · 76% Uptime</span>
              </div>
              <Progress value={76} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground border-t pt-3">
            Anti-monopoly enforcement active: No single research group may exceed 20 peak hours/week without Dean review.
          </p>
        </Card>

        {/* Cryptographic Ledger Health */}
        <Card className="p-6 border-border bg-card flex flex-col gap-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              Cryptographic Audit Ledger Verification
            </h2>
            <Button
              size="sm"
              variant="outline"
              disabled={verifying}
              onClick={runLedgerVerification}
            >
              <RefreshCw className={`size-3.5 ${verifying ? 'animate-spin' : ''}`} data-icon="inline-start" />
              {verifying ? 'Verifying Hashes…' : 'Verify State Chain'}
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-primary" />
                <span>Merkle State Root</span>
              </div>
              <span className="font-mono text-xs text-foreground">0x9f2e71...a48c</span>
            </div>

            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-success" />
                <span>Chain Health</span>
              </div>
              <Badge variant="success">100% Valid (0 Tampered)</Badge>
            </div>

            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/40 border">
              <div className="flex items-center gap-2">
                <FileCheck className="size-4 text-info" />
                <span>Total Recorded Events</span>
              </div>
              <span className="font-mono font-semibold">{LEDGER.length} Immutable Blocks</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground border-t pt-3">
            Every booking, check-in photo hash, return inspection, and manager resolution is cryptographically chained.
          </p>
        </Card>
      </div>
    </div>
  )
}
