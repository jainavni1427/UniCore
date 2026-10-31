'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export type Filters = {
  institutions: string[]
  distance: string
  resolution: number
  levels: number[]
  consumables: string[]
  within48h: boolean
  weekend: boolean
  eligibleOnly: boolean
}

export const DEFAULT_FILTERS: Filters = {
  institutions: [],
  distance: 'any',
  resolution: 1,
  levels: [],
  consumables: [],
  within48h: false,
  weekend: false,
  eligibleOnly: false,
}

const INSTITUTIONS = ['IIT Bombay', 'IISc Bangalore', 'TIFR Mumbai']
const DISTANCES = [
  { label: 'Any distance', value: 'any' },
  { label: 'Within 5 km', value: '5' },
  { label: 'Within 15 km', value: '15' },
  { label: 'Within 50 km', value: '50' },
]
const LEVELS = [
  { value: 1, label: 'Level 1 — Supervised' },
  { value: 2, label: 'Level 2 — Autonomous' },
  { value: 3, label: 'Level 3 — Expert' },
]
const CONSUMABLES = [
  { value: 'ln2', label: 'Requires LN₂' },
  { value: 'sample-prep', label: 'Sample prep available' },
]

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-6">
      <Field orientation="horizontal" className="rounded-lg border bg-primary/[0.06] border-primary/20 px-3 py-2.5">
        <FieldLabel htmlFor="eligible-only" className="flex-1 text-sm">
          Only show instruments I can book
        </FieldLabel>
        <Switch id="eligible-only" checked={filters.eligibleOnly} onCheckedChange={(v) => set('eligibleOnly', v)} />
      </Field>

      <FieldSet>
        <FieldLegend variant="label">Institution & location</FieldLegend>
        <FieldGroup className="gap-3">
          {INSTITUTIONS.map((inst) => (
            <Field key={inst} orientation="horizontal">
              <Checkbox
                id={`inst-${inst}`}
                checked={filters.institutions.includes(inst)}
                onCheckedChange={() => set('institutions', toggle(filters.institutions, inst))}
              />
              <FieldLabel htmlFor={`inst-${inst}`} className="font-normal">
                {inst}
              </FieldLabel>
            </Field>
          ))}
          <Field>
            <FieldLabel className="sr-only">Distance</FieldLabel>
            <Select items={DISTANCES} value={filters.distance} onValueChange={(v) => set('distance', (v as string) ?? 'any')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DISTANCES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Technical specifications</FieldLegend>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="resolution" className="font-normal text-muted-foreground">
              Max resolution
            </FieldLabel>
            <span className="text-sm font-medium tabular-nums">
              {filters.resolution >= 1 ? 'Any' : `≤ ${filters.resolution.toFixed(1)} nm`}
            </span>
          </div>
          <Slider
            id="resolution"
            min={0.1}
            max={1}
            step={0.1}
            value={[filters.resolution]}
            onValueChange={(v) => set('resolution', Array.isArray(v) ? v[0] : v)}
            aria-label="Maximum resolution in nanometres"
          />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>0.1 nm</span>
            <span>1.0 nm</span>
          </div>
        </Field>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Access & compliance</FieldLegend>
        <FieldGroup className="gap-3">
          {LEVELS.map((l) => (
            <Field key={l.value} orientation="horizontal">
              <Checkbox
                id={`lvl-${l.value}`}
                checked={filters.levels.includes(l.value)}
                onCheckedChange={() => set('levels', toggle(filters.levels, l.value))}
              />
              <FieldLabel htmlFor={`lvl-${l.value}`} className="font-normal">
                {l.label}
              </FieldLabel>
            </Field>
          ))}
          {CONSUMABLES.map((c) => (
            <Field key={c.value} orientation="horizontal">
              <Checkbox
                id={`con-${c.value}`}
                checked={filters.consumables.includes(c.value)}
                onCheckedChange={() => set('consumables', toggle(filters.consumables, c.value))}
              />
              <FieldLabel htmlFor={`con-${c.value}`} className="font-normal">
                {c.label}
              </FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Availability</FieldLegend>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="within48" className="flex-1 font-normal">
              Available within 48 hours
            </FieldLabel>
            <Switch id="within48" checked={filters.within48h} onCheckedChange={(v) => set('within48h', v)} />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="weekend" className="flex-1 font-normal">
              Weekend slots open
            </FieldLabel>
            <Switch id="weekend" checked={filters.weekend} onCheckedChange={(v) => set('weekend', v)} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <Button variant="ghost" size="sm" className="self-start" onClick={() => onChange(DEFAULT_FILTERS)}>
        Reset all filters
      </Button>
    </div>
  )
}
