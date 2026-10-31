'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, SearchX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAppState } from '@/components/app-state'
import { INSTRUMENTS, getEligibility } from '@/lib/unicore-data'
import { FilterPanel, DEFAULT_FILTERS, type Filters } from './filter-panel'
import { InstrumentCard } from './instrument-card'

type SortKey = 'availability' | 'distance' | 'health'

const eligibilityRank = { eligible: 0, conditional: 1, missing: 2 }

export function ExploreView() {
  const { heldCredentialIds } = useAppState()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortKey>('availability')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return INSTRUMENTS.map((instrument) => ({ instrument, eligibility: getEligibility(instrument, heldCredentialIds) }))
      .filter(({ instrument: i, eligibility }) => {
        if (q && ![i.name, i.category, i.institution, i.facility, ...i.specs].some((s) => s.toLowerCase().includes(q))) return false
        if (filters.institutions.length && !filters.institutions.includes(i.institution)) return false
        if (filters.distance !== 'any' && i.distanceKm > Number(filters.distance)) return false
        if (filters.resolution < 1 && (i.resolutionNm === null || i.resolutionNm > filters.resolution)) return false
        if (filters.levels.length && !filters.levels.includes(i.trainingLevel)) return false
        if (filters.consumables.length && !filters.consumables.every((c) => i.consumables.includes(c as 'ln2' | 'sample-prep'))) return false
        if (filters.within48h && !i.within48h) return false
        if (filters.weekend && !i.weekendSlots) return false
        if (filters.eligibleOnly && eligibility.status === 'missing') return false
        return true
      })
      .sort((a, b) => {
        if (sort === 'distance') return a.instrument.distanceKm - b.instrument.distanceKm
        if (sort === 'health') return b.instrument.healthIndex - a.instrument.healthIndex
        const r = eligibilityRank[a.eligibility.status] - eligibilityRank[b.eligibility.status]
        if (r !== 0) return r
        return Number(b.instrument.status.kind === 'available') - Number(a.instrument.status.kind === 'available')
      })
  }, [query, filters, sort, heldCredentialIds])

  const eligibleCount = results.filter((r) => r.eligibility.status !== 'missing').length
  const activeFilterCount =
    filters.institutions.length +
    filters.levels.length +
    filters.consumables.length +
    Number(filters.distance !== 'any') +
    Number(filters.resolution < 1) +
    Number(filters.within48h) +
    Number(filters.weekend) +
    Number(filters.eligibleOnly)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Explore shared instruments</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Eligibility is checked against your Researcher Passport in real time — you only see what you can actually book, and exactly
          why when you can&apos;t.
        </p>
      </div>

      <div className="flex gap-8">
        <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block" aria-label="Filters">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4" aria-label="Instrument results">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search instruments, techniques or facilities"
                aria-label="Search instruments"
                className="h-10 pl-9"
              />
            </div>
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" className="h-10 lg:hidden">
                    <SlidersHorizontal data-icon="inline-start" />
                    Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
                  </Button>
                }
              />
              <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow by location, specifications and access.</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <FilterPanel filters={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="font-medium text-foreground tabular-nums">{results.length}</span> instruments ·{' '}
              <span className="text-success tabular-nums">{eligibleCount}</span> bookable by you
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort</span>
              <ToggleGroup
                variant="outline"
                size="sm"
                spacing={0}
                value={[sort]}
                onValueChange={(v) => v[0] && setSort(v[0] as SortKey)}
                aria-label="Sort results"
              >
                <ToggleGroupItem value="availability">Best match</ToggleGroupItem>
                <ToggleGroupItem value="distance">Distance</ToggleGroupItem>
                <ToggleGroupItem value="health">Health</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <SearchX className="size-6 text-muted-foreground" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">No instruments match these filters</p>
                <p className="text-sm text-muted-foreground">Try widening distance or clearing specification filters.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setQuery('')
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {results.map(({ instrument, eligibility }) => (
                <InstrumentCard key={instrument.id} instrument={instrument} eligibility={eligibility} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
