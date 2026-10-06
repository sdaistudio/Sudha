/**
 * SYNTHETIC DATA. Every name, branch, territory, zone and number in this file is
 * fictional and exists only to illustrate the proposed Sudha experience. None of
 * it is SUD Life, BOI or UBI data.
 */
import type {
  CoverageBranch,
  CoverageRollupRow,
  KpiFixture,
  LongGapBranch,
  PresenceRollupRow,
  PresenceSo,
  RecognitionItem,
  ReviewFixture,
  RoleId,
  RoleProfile,
  TerritoryCoverage,
} from './types'

export const ROLES: RoleProfile[] = [
  { id: 'so', label: 'Sales Officer', person: 'Rohan', spanName: 'Rohan Mehta · 5 mapped branches', spanSummary: 'Own numbers only', seesSoNames: false, childUnit: 'branch' },
  { id: 'tm', label: 'Territory Manager', person: 'Kavya', spanName: 'West Harbour Territory · 18 SOs · 23 branches', spanSummary: 'Direct manager — sees own SO names', seesSoNames: true, childUnit: 'SO' },
  { id: 'rm', label: 'Regional Manager', person: 'Suresh', spanName: 'Coastal Region · 6 territories', spanSummary: 'Counts and territories, no SO names', seesSoNames: false, childUnit: 'territory' },
  { id: 'zh', label: 'Zonal Head', person: 'Farah', spanName: 'Western Zone · 5 regions', spanSummary: 'Coverage % by region and bank', seesSoNames: false, childUnit: 'region' },
  { id: 'lead', label: 'Leadership', person: 'Vivek', spanName: 'All India (illustrative) · 6 zone groups', spanSummary: 'Consolidated view by zone and bank', seesSoNames: false, childUnit: 'zone group' },
]

export const roleById = (id: RoleId): RoleProfile => ROLES.find((r) => r.id === id)!

/* ------------------------------------------------------------------ */
/* Branch coverage · 09:00                                              */
/* ------------------------------------------------------------------ */

export const TM_MAPPED_BRANCHES = 23

/** The TM's six unvisited branches, longest gap first (9, 7, 6, 5, 5, 4 days). */
export const TM_UNVISITED: CoverageBranch[] = [
  { id: 'b1', name: 'Riverside Main', bank: 'BOI', daysSince: 9, so: 'Rohan Mehta' },
  { id: 'b2', name: 'Lakeview', bank: 'UBI', daysSince: 7, so: 'Meera Iyer' },
  { id: 'b3', name: 'Hillcrest', bank: 'BOI', daysSince: 6, so: 'Rohan Mehta' },
  { id: 'b4', name: 'Sector 7 Market', bank: 'UBI', daysSince: 5, so: 'Arjun Desai' },
  { id: 'b5', name: 'Palm Grove', bank: 'BOI', daysSince: 5, so: 'Meera Iyer' },
  { id: 'b6', name: 'Old Town', bank: 'UBI', daysSince: 4, so: 'Arjun Desai' },
]
export const TM_UNVISITED_YESTERDAY = 7

/** The SO's own mapped branches. Two of them appear in the TM list above. */
export const SO_BRANCHES: { id: string; name: string; bank: 'BOI' | 'UBI'; daysSince: number }[] = [
  { id: 'b1', name: 'Riverside Main', bank: 'BOI', daysSince: 9 },
  { id: 'b3', name: 'Hillcrest', bank: 'BOI', daysSince: 6 },
  { id: 's3', name: 'Creekside', bank: 'UBI', daysSince: 1 },
  { id: 's4', name: 'Station Road', bank: 'BOI', daysSince: 2 },
  { id: 's5', name: 'Fort View', bank: 'UBI', daysSince: 3 },
]

export const RM_TERRITORIES: TerritoryCoverage[] = [
  { name: 'Hill Road', unvisited: 8, mapped: 26, lastWeekUnvisited: 7, buckets: [{ label: '4–6 days', count: 4 }, { label: '7–9 days', count: 3 }, { label: '10+ days', count: 1 }], byBank: { BOI: 5, UBI: 3 } },
  { name: 'West Harbour', unvisited: 6, mapped: 23, lastWeekUnvisited: 8, buckets: [{ label: '4–6 days', count: 4 }, { label: '7–9 days', count: 2 }, { label: '10+ days', count: 0 }], byBank: { BOI: 3, UBI: 3 } },
  { name: 'Market Square', unvisited: 5, mapped: 24, lastWeekUnvisited: 5, buckets: [{ label: '4–6 days', count: 3 }, { label: '7–9 days', count: 2 }, { label: '10+ days', count: 0 }], byBank: { BOI: 2, UBI: 3 } },
  { name: 'Mill Lane', unvisited: 4, mapped: 22, lastWeekUnvisited: 6, buckets: [{ label: '4–6 days', count: 3 }, { label: '7–9 days', count: 1 }, { label: '10+ days', count: 0 }], byBank: { BOI: 2, UBI: 2 } },
  { name: 'North Creek', unvisited: 3, mapped: 21, lastWeekUnvisited: 3, buckets: [{ label: '4–6 days', count: 3 }, { label: '7–9 days', count: 0 }, { label: '10+ days', count: 0 }], byBank: { BOI: 1, UBI: 2 } },
  { name: 'Bay Front', unvisited: 2, mapped: 19, lastWeekUnvisited: 2, buckets: [{ label: '4–6 days', count: 2 }, { label: '7–9 days', count: 0 }, { label: '10+ days', count: 0 }], byBank: { BOI: 1, UBI: 1 } },
]

export const ZH_REGIONS: CoverageRollupRow[] = [
  { name: 'Coastal', bank: { BOI: { visited: 60, mapped: 74 }, UBI: { visited: 47, mapped: 61 } } },
  { name: 'Lakeshore', bank: { BOI: { visited: 68, mapped: 70 }, UBI: { visited: 57, mapped: 58 } } },
  { name: 'Ridge', bank: { BOI: { visited: 60, mapped: 62 }, UBI: { visited: 49, mapped: 52 } } },
  { name: 'Valley', bank: { BOI: { visited: 71, mapped: 75 }, UBI: { visited: 45, mapped: 47 } } },
  { name: 'Plateau', bank: { BOI: { visited: 52, mapped: 55 }, UBI: { visited: 61, mapped: 65 } } },
]

export const ZH_LONGEST: LongGapBranch[] = [
  { name: 'Quarry Road', bank: 'BOI', unit: 'Coastal', daysSince: 13 },
  { name: 'Sunset Lane', bank: 'UBI', unit: 'Coastal', daysSince: 12 },
  { name: 'Riverside Main', bank: 'BOI', unit: 'Coastal', daysSince: 9 },
  { name: 'Tannery Street', bank: 'UBI', unit: 'Ridge', daysSince: 9 },
  { name: 'Orchard Park', bank: 'BOI', unit: 'Valley', daysSince: 8 },
  { name: 'Lakeview', bank: 'UBI', unit: 'Coastal', daysSince: 7 },
  { name: 'Granary Cross', bank: 'BOI', unit: 'Plateau', daysSince: 7 },
  { name: 'Mint Square', bank: 'UBI', unit: 'Lakeshore', daysSince: 7 },
  { name: 'Hillcrest', bank: 'BOI', unit: 'Coastal', daysSince: 6 },
  { name: 'Canal Bank', bank: 'UBI', unit: 'Ridge', daysSince: 6 },
]

export const LEAD_ZONES: CoverageRollupRow[] = [
  { name: 'Northern Plains', bank: { BOI: { visited: 1460, mapped: 1720 }, UBI: { visited: 1180, mapped: 1395 } } },
  { name: 'Western Zone', bank: { BOI: { visited: 311, mapped: 336 }, UBI: { visited: 259, mapped: 283 } } },
  { name: 'Deccan', bank: { BOI: { visited: 1210, mapped: 1405 }, UBI: { visited: 990, mapped: 1210 } } },
  { name: 'Eastern Delta', bank: { BOI: { visited: 1385, mapped: 1590 }, UBI: { visited: 905, mapped: 1150 } } },
  { name: 'Central Highlands', bank: { BOI: { visited: 1120, mapped: 1300 }, UBI: { visited: 870, mapped: 1010 } } },
  { name: 'Southern Peninsula', bank: { BOI: { visited: 1060, mapped: 1215 }, UBI: { visited: 1010, mapped: 1180 } } },
]

/* ------------------------------------------------------------------ */
/* Field presence pulse · 10:00 / 11:00 / 12:00                         */
/* ------------------------------------------------------------------ */

/** 18 mapped SOs. Counts by slot: logged in 8 → 11 → 15, checked in 5 → 9 → 12, leads 2 → 5 → 9. */
export const TM_PRESENCE: PresenceSo[] = [
  { name: 'Rohan Mehta', loginAt: '09:48', checkinAt: '10:40', leads: { '10:00': 0, '11:00': 1, '12:00': 1 } },
  { name: 'Meera Iyer', loginAt: '09:20', checkinAt: '09:55', leads: { '10:00': 1, '11:00': 1, '12:00': 2 } },
  { name: 'Arjun Desai', loginAt: null, checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Ananya Rao', loginAt: '09:05', checkinAt: '09:40', leads: { '10:00': 1, '11:00': 1, '12:00': 1 } },
  { name: 'Vikram Nair', loginAt: '09:30', checkinAt: '09:58', leads: { '10:00': 0, '11:00': 1, '12:00': 1 } },
  { name: 'Sneha Kulkarni', loginAt: '09:15', checkinAt: '09:50', leads: { '10:00': 0, '11:00': 0, '12:00': 1 } },
  { name: 'Karan Malhotra', loginAt: '09:35', checkinAt: '10:20', leads: { '10:00': 0, '11:00': 1, '12:00': 1 } },
  { name: 'Pooja Bhatt', loginAt: '09:50', checkinAt: '10:45', leads: { '10:00': 0, '11:00': 0, '12:00': 1 } },
  { name: 'Imran Shaikh', loginAt: '09:45', checkinAt: '09:57', leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Divya Menon', loginAt: '10:10', checkinAt: '10:50', leads: { '10:00': 0, '11:00': 0, '12:00': 1 } },
  { name: 'Rahul Verma', loginAt: '10:25', checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Neha Gupta', loginAt: '10:40', checkinAt: '11:30', leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Siddharth Jain', loginAt: '11:05', checkinAt: '11:40', leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Priyanka Das', loginAt: '11:20', checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Aditya Kumar', loginAt: '11:45', checkinAt: '11:55', leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Lakshmi Pillai', loginAt: '11:50', checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Farhan Ali', loginAt: null, checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
  { name: 'Kiran Joshi', onLeave: true, loginAt: null, checkinAt: null, leads: { '10:00': 0, '11:00': 0, '12:00': 0 } },
]
export const TM_PRESENCE_YESTERDAY_12 = 13

export const SO_PRESENCE_BRANCH = 'UBI Creekside'

export const RM_PRESENCE: PresenceRollupRow[] = [
  { name: 'West Harbour', mapped: 18, onLeave: 1, logged: { '10:00': 8, '11:00': 11, '12:00': 15 }, checked: { '10:00': 5, '11:00': 9, '12:00': 12 } },
  { name: 'Hill Road', mapped: 20, onLeave: 2, logged: { '10:00': 7, '11:00': 12, '12:00': 14 }, checked: { '10:00': 4, '11:00': 8, '12:00': 11 } },
  { name: 'Market Square', mapped: 19, onLeave: 0, logged: { '10:00': 10, '11:00': 15, '12:00': 17 }, checked: { '10:00': 6, '11:00': 11, '12:00': 14 } },
  { name: 'Mill Lane', mapped: 17, onLeave: 1, logged: { '10:00': 9, '11:00': 13, '12:00': 15 }, checked: { '10:00': 5, '11:00': 10, '12:00': 13 } },
  { name: 'North Creek', mapped: 16, onLeave: 0, logged: { '10:00': 9, '11:00': 13, '12:00': 15 }, checked: { '10:00': 6, '11:00': 11, '12:00': 13 } },
  { name: 'Bay Front', mapped: 15, onLeave: 1, logged: { '10:00': 8, '11:00': 12, '12:00': 13 }, checked: { '10:00': 5, '11:00': 9, '12:00': 12 } },
]

export const ZH_PRESENCE: PresenceRollupRow[] = [
  { name: 'Coastal', mapped: 105, onLeave: 5, logged: { '10:00': 51, '11:00': 76, '12:00': 89 }, checked: { '10:00': 31, '11:00': 58, '12:00': 75 } },
  { name: 'Lakeshore', mapped: 96, onLeave: 3, logged: { '10:00': 55, '11:00': 78, '12:00': 86 }, checked: { '10:00': 35, '11:00': 61, '12:00': 74 } },
  { name: 'Ridge', mapped: 88, onLeave: 4, logged: { '10:00': 44, '11:00': 66, '12:00': 76 }, checked: { '10:00': 27, '11:00': 50, '12:00': 63 } },
  { name: 'Valley', mapped: 92, onLeave: 2, logged: { '10:00': 50, '11:00': 74, '12:00': 83 }, checked: { '10:00': 33, '11:00': 59, '12:00': 71 } },
  { name: 'Plateau', mapped: 84, onLeave: 3, logged: { '10:00': 46, '11:00': 67, '12:00': 75 }, checked: { '10:00': 30, '11:00': 54, '12:00': 64 } },
]

export const LEAD_PRESENCE: PresenceRollupRow[] = [
  { name: 'Northern Plains', mapped: 1240, onLeave: 41, logged: { '10:00': 640, '11:00': 930, '12:00': 1062 }, checked: { '10:00': 402, '11:00': 715, '12:00': 870 } },
  { name: 'Western Zone', mapped: 465, onLeave: 17, logged: { '10:00': 246, '11:00': 361, '12:00': 409 }, checked: { '10:00': 156, '11:00': 282, '12:00': 347 } },
  { name: 'Deccan', mapped: 1010, onLeave: 30, logged: { '10:00': 520, '11:00': 760, '12:00': 868 }, checked: { '10:00': 318, '11:00': 590, '12:00': 712 } },
  { name: 'Eastern Delta', mapped: 1115, onLeave: 38, logged: { '10:00': 540, '11:00': 805, '12:00': 930 }, checked: { '10:00': 330, '11:00': 610, '12:00': 760 } },
  { name: 'Central Highlands', mapped: 905, onLeave: 26, logged: { '10:00': 470, '11:00': 690, '12:00': 790 }, checked: { '10:00': 290, '11:00': 528, '12:00': 655 } },
  { name: 'Southern Peninsula', mapped: 1045, onLeave: 33, logged: { '10:00': 560, '11:00': 812, '12:00': 921 }, checked: { '10:00': 352, '11:00': 640, '12:00': 776 } },
]

/* ------------------------------------------------------------------ */
/* Business KPI digest                                                  */
/* ------------------------------------------------------------------ */

export const KPIS: Record<RoleId, KpiFixture> = {
  so: {
    current: { budget: 0.06, collection: 0.046, epis: 0.041, bv: 60, ba: 60, leads: 3.2, conv: 6.3 },
    lastWeek: { budget: 0.06, collection: 0.031, epis: 0.027, bv: 80, ba: 60, leads: 3.0, conv: 5.9 },
  },
  tm: {
    current: { budget: 1.2, collection: 0.82, epis: 0.68, bv: 73.9, ba: 52.2, leads: 2.7, conv: 8.4, soActive: 83.3, sp: 92, manning: 90 },
    lastWeek: { budget: 1.2, collection: 0.58, epis: 0.49, bv: 65.2, ba: 47.8, leads: 2.6, conv: 8.9, soActive: 77.8, sp: 90, manning: 90 },
  },
  rm: {
    current: { budget: 7.4, collection: 5.1, epis: 4.62, bv: 79.3, ba: 54.8, leads: 3.1, conv: 9.2, soActive: 86.4, sp: 96, manning: 94 },
    lastWeek: { budget: 7.4, collection: 3.7, epis: 3.21, bv: 75.6, ba: 51.9, leads: 3.0, conv: 9.4, soActive: 84.1, sp: 95, manning: 94 },
  },
  zh: {
    current: { budget: 31.5, collection: 22.4, epis: 18.9, bv: 92.1, ba: 47.9, leads: 2.4, conv: 4.1, soActive: 88, sp: 101, manning: 97 },
    lastWeek: { budget: 31.5, collection: 16.2, epis: 13.4, bv: 90.5, ba: 46.2, leads: 2.5, conv: 4.4, soActive: 87.1, sp: 100, manning: 97 },
  },
  lead: {
    current: { budget: 412, collection: 301.6, epis: 268.5, bv: 85.3, ba: 50.2, leads: 2.9, conv: 7.6, soActive: 85.9, sp: 97.5, manning: 95.2 },
    lastWeek: { budget: 412, collection: 221.4, epis: 191.2, bv: 83.5, ba: 49.1, leads: 2.8, conv: 7.4, soActive: 85.2, sp: 97.1, manning: 95.0 },
  },
}

export const RECOGNITION: Record<RoleId, RecognitionItem[]> = {
  so: [
    { who: 'You', why: 'Lead creation at 3.2 a day — above the 3.0 target for a third straight week.' },
    { who: 'You', why: 'Creekside branch active again after two quiet weeks.' },
  ],
  tm: [
    { who: 'Meera Iyer', why: 'Highest conversion in the territory this week — 14% on 22 leads.' },
    { who: 'Ananya Rao', why: 'First check-in before 09:45 every day this week.' },
    { who: 'Vikram Nair', why: 'All five mapped branches visited and three active.' },
  ],
  rm: [
    { who: 'North Creek territory', why: 'Ahead of month pace for the second week running.' },
    { who: 'Mill Lane territory', why: 'Unvisited branches down from 6 to 4 week on week.' },
  ],
  zh: [
    { who: 'Lakeshore region', why: 'Branch visit at 98% with conversion up 1.2 pts.' },
    { who: 'Plateau region', why: 'SP penetration at 104% — every mapped SP covered.' },
  ],
  lead: [
    { who: 'Southern Peninsula', why: 'Highest share of branches active, both banks.' },
    { who: 'Western Zone', why: 'Branch visit 92% — highest coverage of any zone group.' },
  ],
}

/* ------------------------------------------------------------------ */
/* Review companion                                                     */
/* ------------------------------------------------------------------ */

export const REVIEWS: Record<Exclude<RoleId, 'so'>, ReviewFixture> = {
  tm: {
    title: 'Weekly territory review · West Harbour',
    strengths: ['Branch active at 52% — above the 51% target.', 'Weekly SO active up 5.5 pts to 83%.', 'Meera Iyer converting at 14% — share her approach.'],
    gaps: ['Conversion 8.4% against 10% — slipped 0.5 pts.', '6 branches unvisited this week; Rohan Mehta and Arjun Desai hold four.', 'Gap to pace ₹0.09 Cr with 11 days to go.'],
    commitments: [
      { owner: 'Rohan Mehta', text: 'Visit Riverside Main and Hillcrest by Friday', status: 'Moving' },
      { owner: 'Arjun Desai', text: 'Follow up 6 leads older than 10 days', status: 'Open' },
    ],
    units: [
      { name: 'Meera Iyer', bv: 60, leads: 3.6, conv: 14.1, detail: ['22 leads this week, 3 logins', 'Two branches unvisited — Lakeview (7 days), Palm Grove (5 days)'] },
      { name: 'Rohan Mehta', bv: 60, leads: 3.2, conv: 6.3, detail: ['Riverside Main 9 days, Hillcrest 6 days since visit', 'Leads healthy; logins lagging'] },
      { name: 'Arjun Desai', bv: 50, leads: 1.8, conv: 4.2, detail: ['No login yet today', '6 open leads older than 10 days'] },
      { name: 'Ananya Rao', bv: 100, leads: 3.0, conv: 10.4, detail: ['All branches visited', 'Conversion on target'] },
    ],
    owners: ['Rohan Mehta', 'Meera Iyer', 'Arjun Desai', 'Ananya Rao', 'Kavya (TM)'],
  },
  rm: {
    title: 'Weekly regional review · Coastal Region',
    strengths: ['Weekly SO active 86% — above the 85% target.', 'Leads per SO at 3.1 a day.', 'North Creek ahead of month pace.'],
    gaps: ['Ach 62.4% against 64.5% pace — ₹0.15 Cr behind.', 'Hill Road has 8 unvisited branches, up 1 on last week.', 'Conversion 9.2% — two territories below 7%.'],
    commitments: [
      { owner: 'Hill Road TM', text: 'Cover 8 unvisited branches by Friday', status: 'Open' },
      { owner: 'West Harbour TM', text: 'Lead-ageing calls with 2 SOs', status: 'Moving' },
    ],
    units: [
      { name: 'Hill Road', bv: 69.2, leads: 3.4, conv: 9.8, detail: ['8 branches unvisited (1 over 10 days)', 'Conversion near target — a coverage problem, not a closing problem'] },
      { name: 'West Harbour', bv: 73.9, leads: 2.7, conv: 8.4, detail: ['6 branches unvisited', '2 SOs below 5% conversion for 3 weeks'] },
      { name: 'Market Square', bv: 79.2, leads: 3.5, conv: 6.1, detail: ['Activity on target', '4 SOs below 5% conversion; 31 leads older than 10 days'] },
      { name: 'North Creek', bv: 85.7, leads: 3.3, conv: 12.0, detail: ['Ahead of pace', 'Recognition candidate'] },
    ],
    owners: ['Hill Road TM', 'West Harbour TM', 'Market Square TM', 'North Creek TM', 'Regional office'],
  },
  zh: {
    title: 'Weekly zonal review · Western Zone',
    strengths: ['Branch visit 92.1% against an 80% target.', 'Weekly SO active 88%.', 'SP penetration 101%.'],
    gaps: ['Conversion 4.1% against 10% — activity is not the issue, closing is.', 'Ach 60% against 64.5% pace — ₹1.42 Cr behind.', 'Leads per SO 2.4 against 3.'],
    commitments: [{ owner: 'Coastal RM', text: 'Lead-ageing plan for two territories', status: 'Open' }],
    units: [
      { name: 'Coastal', bv: 79.3, leads: 3.1, conv: 9.2, detail: ['Two territories below 7% conversion', 'Coverage gap concentrated in Hill Road'] },
      { name: 'Lakeshore', bv: 97.7, leads: 2.2, conv: 2.8, detail: ['Three territories carry most open leads', 'Six SOs under 2% conversion for four weeks'] },
      { name: 'Ridge', bv: 95.6, leads: 2.1, conv: 3.0, detail: ['Lead creation below 2.5 in four territories'] },
      { name: 'Valley', bv: 95.1, leads: 2.4, conv: 3.6, detail: ['Conversion improving 0.4 pts week on week'] },
    ],
    owners: ['Coastal RM', 'Lakeshore RM', 'Ridge RM', 'Valley RM', 'Plateau RM'],
  },
  lead: {
    title: 'Weekly channel review · All India (illustrative)',
    strengths: ['Ach 65.2% — ahead of 64.5% month pace.', 'Branch visit 85.3% against 80%.', 'Weekly SO active 85.9%.'],
    gaps: ['Lead conversion 7.6% against 10%.', 'Branch active 50.2% against 51%.', 'Manning 95.2% — vacancies concentrated in two zone groups.'],
    commitments: [{ owner: 'Channel strategy', text: 'Conversion clinic for the three lowest zones', status: 'Open' }],
    units: [
      { name: 'Northern Plains', bv: 84.8, leads: 3.0, conv: 8.1, detail: ['Conversion gap in two zones'] },
      { name: 'Western Zone', bv: 92.1, leads: 2.4, conv: 4.1, detail: ['Highest coverage, lowest conversion — a closing problem'] },
      { name: 'Eastern Delta', bv: 83.6, leads: 2.9, conv: 7.9, detail: ['UBI coverage trails BOI by 8 pts'] },
      { name: 'Southern Peninsula', bv: 86.4, leads: 3.2, conv: 9.6, detail: ['Near target on most measures'] },
    ],
    owners: ['Channel strategy', 'Northern Plains ZBH', 'Western Zone ZH', 'Eastern Delta ZBH'],
  },
}

export const SO_COMMITMENTS = [
  { text: 'Visit Riverside Main and Hillcrest by Friday', from: 'Weekly territory review', status: 'Moving' as const },
  { text: 'Move two proposals with pending documents', from: '1-on-1 with your TM', status: 'Open' as const },
]
