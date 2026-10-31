import { LEDGER, type LedgerEvent } from '@/lib/unicore-data'
import { cn } from '@/lib/utils'

const dot: Record<LedgerEvent['tone'], string> = {
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  neutral: 'bg-muted-foreground',
}

export function CustodyLedger({ events = LEDGER }: { events?: LedgerEvent[] }) {
  return (
    <ol className="relative flex flex-col">
      {events.map((e, i) => (
        <li key={e.type + e.time} className="relative flex gap-4 pb-6 last:pb-0">
          {i < events.length - 1 && <span className="absolute top-3 left-[5px] h-full w-px bg-border" aria-hidden />}
          <span className={cn('relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-card', dot[e.tone])} aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="text-sm font-semibold tracking-wide">{e.type.replaceAll('_', ' ')}</p>
              <time className="text-xs text-muted-foreground tabular-nums">{e.time}</time>
            </div>
            <p className="text-xs text-muted-foreground">{e.actor}</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-foreground/80">
              {e.lines.map((l) => (
                <li key={l} className="break-words">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}
