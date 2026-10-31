'use client'

import { Download, FileText, Link2, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LEDGER } from '@/lib/unicore-data'

export function ReceiptActions() {
  function handleDownloadPDF() {
    toast.success('Opening Print / PDF Export', {
      description: 'Select "Save as PDF" in your print dialog for the official certificate.',
    })
    setTimeout(() => {
      window.print()
    }, 400)
  }

  function handleExportJSON() {
    const auditData = {
      consortium: 'UniCore Deep-Tech Equipment Exchange',
      certificate_id: 'CERT-BK-9021-ZEISS',
      verified_by: 'Consortium Merkle Ledger (v2.4)',
      merkle_root: '0x9f2e71c4ca4288a91206',
      status: 'COMPLETED & AUDITED',
      timestamp: new Date().toISOString(),
      events: LEDGER,
    }

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'UniCore-Audit-Certificate-BK-9021.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Cryptographic Audit File Downloaded', {
      description: 'Downloaded UniCore-Audit-Certificate-BK-9021.json with tamper-evident hashes.',
    })
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard?.writeText(window.location.href)
          toast.success('Verification link copied to clipboard')
        }}
      >
        <Link2 className="size-3.5" data-icon="inline-start" />
        Share
      </Button>

      <Button variant="outline" size="sm" onClick={handleExportJSON}>
        <FileText className="size-3.5" data-icon="inline-start" />
        Audit JSON
      </Button>

      <Button size="sm" onClick={handleDownloadPDF}>
        <Download className="size-3.5" data-icon="inline-start" />
        Save / Print PDF
      </Button>
    </div>
  )
}
