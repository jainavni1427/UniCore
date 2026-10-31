export type PersonaId = 'researcher' | 'manager' | 'admin'

export type Persona = {
  id: PersonaId
  name: string
  role: string
  org: string
  initials: string
  home: string
}

export const PERSONAS: Persona[] = [
  {
    id: 'researcher',
    name: 'Dr. Aris Thorne',
    role: 'Researcher',
    org: 'External Startup · ICT Bio-Design',
    initials: 'AT',
    home: '/explore',
  },
  {
    id: 'manager',
    name: 'Prof. Chen',
    role: 'Facility Manager',
    org: 'Central Nanofabrication Core, IIT Bombay',
    initials: 'PC',
    home: '/manager',
  },
  {
    id: 'admin',
    name: 'Dean R. Kulkarni',
    role: 'Institutional Admin',
    org: 'Cross-campus Compliance Office',
    initials: 'RK',
    home: '/admin',
  },
]

export type CredentialDef = {
  id: string
  name: string
  authority: string
}

export const CREDENTIAL_DEFS: Record<string, CredentialDef> = {
  'sem-l2': { id: 'sem-l2', name: 'SEM Level 2 Badge', authority: 'Central Nanofabrication Core' },
  'lab-safety': { id: 'lab-safety', name: 'General Lab Safety', authority: 'Institute Safety Office' },
  'nano-waiver': { id: 'nano-waiver', name: 'Nano Waiver', authority: 'NanoFab Compliance Board' },
  radiation: { id: 'radiation', name: 'Radiation Safety Certified', authority: 'Atomic Energy Regulatory Board' },
  affiliated: { id: 'affiliated', name: 'Affiliated Researcher', authority: 'UniCore Consortium' },
  'nmr-safety': { id: 'nmr-safety', name: 'High-Field NMR Safety Clearance', authority: 'National Chemical Laboratory' },
  bsl2: { id: 'bsl2', name: 'BSL-2 Wet Lab Handling Clearance', authority: 'Biosafety Review Board' },
  'tem-l2': { id: 'tem-l2', name: 'TEM Autonomous Operator', authority: 'SAIF, IIT Bombay' },
  'chem-waiver': { id: 'chem-waiver', name: 'Chemistry Waiver Signed', authority: 'Department of Chemistry' },
  cryo: { id: 'cryo', name: 'Cryogen Handling', authority: 'Institute Safety Office' },
}

export type Credential = {
  id: string
  title: string
  authority: string
  issued: string
  expires: string | null
  daysToExpiry: number | null
  hash: string
  level?: string
}

export const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: 'sem-l2',
    title: 'Zeiss SEM Operator Level 2',
    authority: 'Central Nanofabrication Core',
    issued: 'Oct 12, 2025',
    expires: 'Oct 12, 2027',
    daysToExpiry: 347,
    hash: 'SHA-9021b',
    level: 'Certified',
  },
  {
    id: 'bsl2',
    title: 'BSL-2 Wet Lab Handling Clearance',
    authority: 'Biosafety Review Board',
    issued: 'Jan 10, 2026',
    expires: null,
    daysToExpiry: null,
    hash: 'SHA-4e7a3',
  },
  {
    id: 'lab-safety',
    title: 'General Lab Safety',
    authority: 'Institute Safety Office',
    issued: 'Nov 18, 2024',
    expires: 'Nov 18, 2026',
    daysToExpiry: 19,
    hash: 'SHA-c4ca42',
  },
  {
    id: 'nano-waiver',
    title: 'Nano Waiver',
    authority: 'NanoFab Compliance Board',
    issued: 'Mar 02, 2026',
    expires: 'Mar 02, 2028',
    daysToExpiry: 489,
    hash: 'SHA-71d0e',
  },
  {
    id: 'affiliated',
    title: 'Affiliated Researcher',
    authority: 'UniCore Consortium',
    issued: 'Aug 01, 2026',
    expires: 'Jul 31, 2027',
    daysToExpiry: 274,
    hash: 'SHA-a19f2',
  },
  {
    id: 'chem-waiver',
    title: 'Chemistry Waiver',
    authority: 'Department of Chemistry',
    issued: 'Sep 14, 2026',
    expires: 'Sep 14, 2027',
    daysToExpiry: 319,
    hash: 'SHA-3bb81',
  },
]

export type InstrumentStatus =
  | { kind: 'available' }
  | { kind: 'in-use'; until: string }
  | { kind: 'maintenance'; until: string }

export type Instrument = {
  id: string
  name: string
  shortName: string
  unitId: string
  category: 'SEM' | 'XRD' | 'NMR' | 'TEM' | 'Raman'
  institution: 'IIT Bombay' | 'IISc Bangalore' | 'TIFR Mumbai'
  facility: string
  distanceKm: number
  specs: string[]
  resolutionNm: number | null
  maxVoltageKv: number | null
  ratePerHour: number
  creditsPerHour: number
  peakBufferMins: number
  prerequisites: string[]
  supervisionUnless?: string
  trainingLevel: 1 | 2 | 3
  consumables: ('ln2' | 'sample-prep')[]
  healthIndex: number
  nextAvailable: string
  within48h: boolean
  weekendSlots: boolean
  status: InstrumentStatus
  images: { src: string; alt: string }[]
  constraints: string[]
  pledges: string[]
  telemetry: {
    filamentHours: number
    filamentLimit: number
    cleanStreak: number
    custodian: string
    custodianOnDuty: boolean
  }
  summary: string
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'zeiss-crossbeam-550',
    name: 'Zeiss Crossbeam 550 Focused Ion Beam SEM',
    shortName: 'Zeiss Crossbeam 550 FIB-SEM',
    unitId: 'ZEISS-550-BOM',
    category: 'SEM',
    institution: 'IIT Bombay',
    facility: 'NanoFab Cleanroom Facility',
    distanceKm: 4.2,
    specs: ['0.8 nm res', '30 kV max', 'SE/BSE detectors', 'Max sample: 50 mm'],
    resolutionNm: 0.8,
    maxVoltageKv: 30,
    ratePerHour: 120,
    creditsPerHour: 15,
    peakBufferMins: 30,
    prerequisites: ['sem-l2', 'lab-safety', 'nano-waiver'],
    trainingLevel: 2,
    consumables: ['sample-prep'],
    healthIndex: 98.2,
    nextAvailable: 'Tomorrow, 10:00 AM',
    within48h: true,
    weekendSlots: true,
    status: { kind: 'available' },
    images: [
      { src: '/instruments/zeiss-crossbeam.png', alt: 'Zeiss Crossbeam 550 FIB-SEM column in the NanoFab cleanroom' },
      { src: '/instruments/zeiss-chamber.png', alt: 'Interior of the specimen chamber showing the stage and sample clips' },
    ],
    constraints: [
      'Max continuous booking: 4 hours',
      'Maintenance buffer: 30 mins (auto-enforced)',
      'Cancellation policy: 12-hr notice or 50% escrow',
    ],
    pledges: ['Specimen is dry, solid, non-magnetic', 'Specimen contains no volatile organic solvents'],
    telemetry: {
      filamentHours: 1420.5,
      filamentLimit: 3000,
      cleanStreak: 42,
      custodian: 'Dr. K. Raman',
      custodianOnDuty: true,
    },
    summary:
      'Dual-beam FIB-SEM for site-specific cross-sectioning, TEM lamella preparation and high-resolution surface imaging of nanostructured materials.',
  },
  {
    id: 'bruker-d8-xrd',
    name: 'Bruker D8 Advance Powder XRD',
    shortName: 'Bruker D8 Advance XRD',
    unitId: 'BRUKER-D8-BLR',
    category: 'XRD',
    institution: 'IISc Bangalore',
    facility: 'Materials Research Centre',
    distanceKm: 12.8,
    specs: ['Cu-Kα source', 'LynxEye XE-T detector', 'High-temp stage'],
    resolutionNm: null,
    maxVoltageKv: 40,
    ratePerHour: 60,
    creditsPerHour: 8,
    peakBufferMins: 15,
    prerequisites: ['radiation', 'affiliated'],
    trainingLevel: 2,
    consumables: ['sample-prep'],
    healthIndex: 95.7,
    nextAvailable: 'Today, 17:30',
    within48h: true,
    weekendSlots: false,
    status: { kind: 'in-use', until: '17:00' },
    images: [{ src: '/instruments/bruker-xrd.png', alt: 'Bruker D8 Advance diffractometer cabinet' }],
    constraints: [
      'Max continuous booking: 6 hours',
      'Maintenance buffer: 15 mins (auto-enforced)',
      'Cancellation policy: 6-hr notice or 25% escrow',
    ],
    pledges: ['Powder sample is finely ground and dry', 'Sample holder is supplied by the facility'],
    telemetry: {
      filamentHours: 2210.0,
      filamentLimit: 4000,
      cleanStreak: 18,
      custodian: 'Dr. S. Nair',
      custodianOnDuty: true,
    },
    summary:
      'Powder diffraction for phase identification, crystallite size and residual stress analysis, with a high-temperature stage up to 1200 °C.',
  },
  {
    id: 'bruker-avance-500',
    name: 'Bruker Avance III 500 MHz NMR',
    shortName: 'Bruker Avance 500 NMR',
    unitId: 'BRUKER-AV500-TIFR',
    category: 'NMR',
    institution: 'TIFR Mumbai',
    facility: 'National NMR Facility',
    distanceKm: 9.6,
    specs: ['500 MHz', 'BBO cryoprobe', 'VT: -150 to 150 °C', '24-slot autosampler'],
    resolutionNm: null,
    maxVoltageKv: null,
    ratePerHour: 90,
    creditsPerHour: 11,
    peakBufferMins: 20,
    prerequisites: ['nmr-safety', 'lab-safety'],
    trainingLevel: 2,
    consumables: ['ln2'],
    healthIndex: 99.1,
    nextAvailable: 'Sat, 09:00 AM',
    within48h: false,
    weekendSlots: true,
    status: { kind: 'available' },
    images: [{ src: '/instruments/bruker-nmr.png', alt: 'Bruker 500 MHz NMR superconducting magnet' }],
    constraints: [
      'Max continuous booking: 8 hours (overnight queue allowed)',
      'Maintenance buffer: 20 mins (auto-enforced)',
      'No ferromagnetic items inside the 5 Gauss line',
    ],
    pledges: ['No ferromagnetic objects carried into the magnet room', 'Sample tubes are rated for 500 MHz'],
    telemetry: {
      filamentHours: 812.4,
      filamentLimit: 5000,
      cleanStreak: 64,
      custodian: 'Dr. M. Pillai',
      custodianOnDuty: false,
    },
    summary:
      'High-field solution-state NMR for structure elucidation of small molecules, polymers and biomolecules with cryoprobe sensitivity.',
  },
  {
    id: 'jeol-2100f',
    name: 'JEOL JEM-2100F Field Emission TEM',
    shortName: 'JEOL JEM-2100F TEM',
    unitId: 'JEOL-2100F-BOM',
    category: 'TEM',
    institution: 'IIT Bombay',
    facility: 'SAIF Electron Microscopy Suite',
    distanceKm: 4.6,
    specs: ['0.19 nm point res', '200 kV', 'STEM + EDS', 'Gatan OneView camera'],
    resolutionNm: 0.19,
    maxVoltageKv: 200,
    ratePerHour: 150,
    creditsPerHour: 19,
    peakBufferMins: 45,
    prerequisites: ['lab-safety', 'affiliated'],
    supervisionUnless: 'tem-l2',
    trainingLevel: 1,
    consumables: ['ln2', 'sample-prep'],
    healthIndex: 96.4,
    nextAvailable: 'Sun, 13:00',
    within48h: true,
    weekendSlots: true,
    status: { kind: 'available' },
    images: [{ src: '/instruments/tem.png', alt: 'JEOL JEM-2100F transmission electron microscope column' }],
    constraints: [
      'Max continuous booking: 3 hours',
      'Maintenance buffer: 45 mins (auto-enforced)',
      'Supervisor must be present for Level 1 operators',
    ],
    pledges: ['Grid is mounted on an approved holder', 'Specimen is beam-stable and non-volatile'],
    telemetry: {
      filamentHours: 3310.2,
      filamentLimit: 6000,
      cleanStreak: 27,
      custodian: 'Dr. A. Deshpande',
      custodianOnDuty: true,
    },
    summary:
      'Field-emission TEM with STEM and EDS for atomic-resolution imaging, diffraction and elemental mapping of thin specimens.',
  },
  {
    id: 'horiba-labram',
    name: 'Horiba LabRAM HR Evolution Raman',
    shortName: 'Horiba LabRAM HR Raman',
    unitId: 'HORIBA-HR-BLR',
    category: 'Raman',
    institution: 'IISc Bangalore',
    facility: 'Centre for Nano Science & Engineering',
    distanceKm: 14.1,
    specs: ['532 / 633 / 785 nm lasers', '800 mm focal length', 'Confocal mapping'],
    resolutionNm: null,
    maxVoltageKv: null,
    ratePerHour: 45,
    creditsPerHour: 6,
    peakBufferMins: 10,
    prerequisites: ['lab-safety'],
    trainingLevel: 1,
    consumables: [],
    healthIndex: 88.0,
    nextAvailable: 'Nov 04, 09:00',
    within48h: false,
    weekendSlots: false,
    status: { kind: 'maintenance', until: 'Nov 03' },
    images: [{ src: '/instruments/bruker-xrd.png', alt: 'Spectroscopy bench at the CeNSE facility' }],
    constraints: ['Max continuous booking: 4 hours', 'Class 3B laser safety eyewear required'],
    pledges: ['Laser eyewear will be worn at all times'],
    telemetry: {
      filamentHours: 4120.0,
      filamentLimit: 5000,
      cleanStreak: 9,
      custodian: 'Dr. V. Rao',
      custodianOnDuty: false,
    },
    summary: 'Confocal Raman spectroscopy and mapping for 2D materials, carbon allotropes and strain analysis.',
  },
]

export type Eligibility = {
  status: 'eligible' | 'conditional' | 'missing'
  missing: string[]
}

export function getEligibility(instrument: Instrument, held: Set<string>): Eligibility {
  const missing = instrument.prerequisites.filter((p) => !held.has(p))
  if (missing.length > 0) return { status: 'missing', missing }
  if (instrument.supervisionUnless && !held.has(instrument.supervisionUnless)) {
    return { status: 'conditional', missing: [] }
  }
  return { status: 'eligible', missing: [] }
}

export type SlotTier = 'peak' | 'standard' | 'off-peak'

export type Slot = {
  id: string
  label: string
  tier: SlotTier
  multiplier: number
  competing: number
}

export const SLOT_DATES = ['Mon, Nov 02', 'Tue, Nov 03', 'Wed, Nov 04', 'Thu, Nov 05']

export const SLOTS: Slot[] = [
  { id: '09-12', label: '09:00 – 12:00', tier: 'peak', multiplier: 3, competing: 1 },
  { id: '13-16', label: '13:00 – 16:00', tier: 'peak', multiplier: 3, competing: 0 },
  { id: '17-20', label: '17:00 – 20:00', tier: 'standard', multiplier: 2, competing: 0 },
  { id: '20-23', label: '20:00 – 23:00', tier: 'off-peak', multiplier: 1, competing: 0 },
]

export const PRICE_FACTOR: Record<SlotTier, number> = { peak: 1, standard: 0.8, 'off-peak': 0.6 }

export const WEEKLY_QUOTA = 20
export const GROUP_USAGE = 4

export function computeFairness(slot: Slot, urgent: boolean) {
  const lowUsageBoost = Math.round(((WEEKLY_QUOTA - GROUP_USAGE) / WEEKLY_QUOTA) * 22)
  const offPeakBonus = slot.tier === 'off-peak' ? 6 : slot.tier === 'standard' ? 3 : 0
  const competitionPenalty = slot.competing * 14
  const score = Math.max(0, Math.min(100, 56 + lowUsageBoost + (urgent ? 10 : 0) + offPeakBonus - competitionPenalty))
  const band = score >= 80 ? 'High' : score >= 60 ? 'Moderate' : 'Low'
  return { score, band, lowUsageBoost, offPeakBonus, competitionPenalty }
}

export type BookingStatus = 'active' | 'approved' | 'pending' | 'waitlisted' | 'completed'

export type Booking = {
  id: string
  instrumentId: string
  date: string
  slot: string
  status: BookingStatus
  credits: number
  note?: string
}

export const BOOKINGS: Booking[] = [
  { id: 'BK-9058', instrumentId: 'zeiss-crossbeam-550', date: 'Today', slot: '14:00 – 17:00', status: 'active', credits: 45 },
  {
    id: 'BK-9067',
    instrumentId: 'jeol-2100f',
    date: 'Sun, Nov 01',
    slot: '13:00 – 16:00',
    status: 'approved',
    credits: 57,
    note: 'Supervisor Dr. A. Deshpande assigned',
  },
  {
    id: 'BK-9042',
    instrumentId: 'zeiss-crossbeam-550',
    date: 'Tomorrow',
    slot: '10:00 – 13:00',
    status: 'pending',
    credits: 45,
    note: 'Awaiting Prof. Chen',
  },
  {
    id: 'BK-9050',
    instrumentId: 'bruker-d8-xrd',
    date: 'Tue, Nov 03',
    slot: '09:00 – 12:00',
    status: 'waitlisted',
    credits: 24,
    note: 'Waitlist #1 — competing user had 0 hrs this week',
  },
  { id: 'BK-9021', instrumentId: 'zeiss-crossbeam-550', date: 'Thu, Oct 29', slot: '14:00 – 17:00', status: 'completed', credits: 45 },
]

export type Notification = {
  id: string
  tone: 'info' | 'warning' | 'success' | 'danger'
  title: string
  body: string
  time: string
  action?: { label: string; href: string }
}

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    tone: 'info',
    title: 'Waitlist position updated',
    body: 'Your waitlist position for Bruker D8 XRD moved from #2 to #1.',
    time: '4 min ago',
    action: { label: 'View booking', href: '/bookings' },
  },
  {
    id: 'n2',
    tone: 'warning',
    title: 'Slot released — claim within 15 minutes',
    body: 'A user cancelled JEOL JEM-2100F, Sat 20:00 – 23:00 (off-peak).',
    time: '12 min ago',
    action: { label: 'Claim slot', href: '/explore/jeol-2100f' },
  },
  {
    id: 'n3',
    tone: 'danger',
    title: 'Manager requested photo re-take',
    body: 'Angle 2 (Objective) on BK-9058 was out of focus. Re-capture at return.',
    time: '38 min ago',
    action: { label: 'Open return flow', href: '/bookings/BK-9058/return' },
  },
]

export type ApprovalRequest = {
  id: string
  instrumentId: string
  slot: string
  applicant: string
  applicantType: string
  prerequisites: { label: string; ok: boolean }[]
  statement: string
  conflict?: {
    competitor: string
    recommendation: string
    reason: string
  }
  fairness: number
}

export const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'BK-9042',
    instrumentId: 'zeiss-crossbeam-550',
    slot: 'Tomorrow 10:00 – 13:00',
    applicant: 'Dr. Aris Thorne',
    applicantType: 'External Startup Founder',
    prerequisites: [
      { label: 'SEM Level 2 Verified', ok: true },
      { label: 'Chemistry Waiver Signed', ok: true },
      { label: 'Escrow Deposit Held: $500', ok: true },
    ],
    statement: 'Defect inspection on chemical vapor deposited 2D transition metal dichalcogenides.',
    conflict: {
      competitor: "Dr. Mehta's Research Group",
      recommendation: 'Award to Dr. Aris Thorne',
      reason: "Dr. Mehta's lab has logged 19 peak hours this week (at quota limit). Dr. Thorne has logged 4.",
    },
    fairness: 88,
  },
  {
    id: 'BK-9047',
    instrumentId: 'zeiss-crossbeam-550',
    slot: 'Mon, Nov 02 20:00 – 23:00',
    applicant: 'Rhea Iyer',
    applicantType: 'PhD Candidate, Metallurgy',
    prerequisites: [
      { label: 'SEM Level 2 Verified', ok: true },
      { label: 'General Lab Safety', ok: true },
      { label: 'Nano Waiver', ok: false },
    ],
    statement: 'Cross-sectional imaging of laser-clad Inconel 718 coatings for porosity quantification.',
    fairness: 71,
  },
]

export type CustodyUnit = {
  unit: string
  operator: string
  booking: string
  started: string
  remaining: string
  filament: string
  state: 'nominal' | 'attention' | 'overdue'
}

export const LIVE_CUSTODY: CustodyUnit[] = [
  { unit: 'Zeiss Crossbeam 550', operator: 'Dr. Aris Thorne', booking: 'BK-9058', started: '14:02', remaining: '1h 14m', filament: '1,421.9 h', state: 'nominal' },
  { unit: 'JEOL JEM-2100F', operator: 'Kabir Shah', booking: 'BK-9061', started: '13:30', remaining: '0h 38m', filament: '3,311.4 h', state: 'nominal' },
  { unit: 'Rigaku SmartLab', operator: 'Dr. L. Fernandes', booking: 'BK-9055', started: '11:00', remaining: 'Overdue 12m', filament: '1,980.2 h', state: 'overdue' },
  { unit: 'Oxford Plasmalab 100', operator: 'Neha Kulkarni', booking: 'BK-9063', started: '15:10', remaining: '2h 05m', filament: '702.0 h', state: 'attention' },
]

export type LedgerEvent = {
  time: string
  type: string
  actor: string
  lines: string[]
  tone: 'info' | 'success' | 'warning' | 'neutral'
}

export const LEDGER: LedgerEvent[] = [
  {
    time: '09:12:04 AM',
    type: 'REQUEST_SUBMITTED',
    actor: 'Dr. Aris Thorne (UID: #usr_882)',
    lines: ['Slot 14:00 – 17:00', 'Declared Specimen: MoS₂ on SiO₂', 'Quota Check: 4/20 hrs (PASS)'],
    tone: 'neutral',
  },
  {
    time: '09:12:06 AM',
    type: 'AI_ELIGIBILITY_PASSED',
    actor: 'System',
    lines: ['OCR verified Zeiss SEM Level 2 Cert (#CERT-771)', 'Exp: 2027-10-12', 'Hash: #c4ca42'],
    tone: 'info',
  },
  {
    time: '09:30:15 AM',
    type: 'ALLOCATION_APPROVED',
    actor: 'Prof. Chen (Facility Director)',
    lines: ['Reason: "Priority confirmed; compliant sample declaration; verified external startup agreement."'],
    tone: 'success',
  },
  {
    time: '02:02:40 PM',
    type: 'PHYSICAL_CHECK_IN',
    actor: 'Dr. Aris Thorne',
    lines: [
      'Authentication: Machine QR Scanned (Lat: 19.1334, Long: 72.9133)',
      'Baseline Evidence: 3 Photos Stored (S3 Bucket Hashes: #ph_1, #ph_2, #ph_3)',
      'Meter: 1,420.50 hrs',
    ],
    tone: 'neutral',
  },
  {
    time: '05:03:10 PM',
    type: 'RETURN_SUBMITTED',
    actor: 'Dr. Aris Thorne',
    lines: ['Exit Evidence: 3 Photos Stored', 'Final Meter: 1,423.52 hrs', 'Anomaly Flagged by AI'],
    tone: 'warning',
  },
  {
    time: '05:45:00 PM',
    type: 'INCIDENT_RESOLVED',
    actor: 'Prof. Chen',
    lines: ['Resolution: "Normal Wear and Tear / Maintenance Fund Cleared. Deposit Released."'],
    tone: 'success',
  },
]

export const CAPTURE_ANGLES = [
  { id: 'stage', label: 'Angle 1', name: 'Stage' },
  { id: 'objective', label: 'Angle 2', name: 'Objective' },
  { id: 'gauge', label: 'Angle 3', name: 'Gauge' },
] as const

export function getInstrument(id: string) {
  return INSTRUMENTS.find((i) => i.id === id)
}

export function getBooking(id: string) {
  return BOOKINGS.find((b) => b.id === id)
}
