const OVERGROWN_RECOVERY_MINIMUM = 150;

export const DEFAULT_CONFIG = {
  baseHourlyRate: 55,
  overtimeThresholdHours: 8,
  overtimeMultiplier: 1.5,
  freeRadiusMiles: 5,
  travelMinimum: 15,
  mowSqftPerHour: 10000,
  shrubsPerHour: 8,
  mulchSqftPerHour: 500,
  blowOffMinutes: 15,
  edgeWorkMinutes: 20,
  gutterMinutesPerStory: 45,
  leafRemovalSqftPerHour: 4000,
  treatLawnSqftPerHour: 15000,
  overgrownMultiplier: 1.5,
  debrisHeavy: 1.35,
  debrisModerate: 1.15,
  zipDefault: 1.0,
  cadenceOneTime: 1.35,
  cadenceWeekly: 0.85,
  cadenceBiweekly: 1.0,
  cadenceMonthly: 1.1,
  perVisitMinimum: 75,
  overgrownRecoveryMinimum: OVERGROWN_RECOVERY_MINIMUM,
  overgownRecoveryMinimum: OVERGROWN_RECOVERY_MINIMUM,
  marginPercent: 40,
  roundingStrategy: 'nearest-five',
};

export const DEFAULT_INPUTS = {
  zip: '',
  travelMiles: null,
  fuelCostPerMile: null,
  overheadPerJobFlat: null,
  driveMinutes: null,
  setupMinutes: null,
  totalAreaUnit: 'sqft',
  totalAreaSqft: null,
  totalAreaAcres: null,
  developedAreaSqft: null,
  turfAreaSqft: 0,
  sqftPerManHour: null,
  estimatedManHours: null,
  turfSqft: null,
  bedSqft: null,
  mulchCost: null,
  mulchBedMinutes: null,
  treesCount: null,
  shrubsCount: null,
  shrubTrimMinutes: null,
  lawnTreatmentMinutes: null,
  lawnTreatmentCost: null,
  gutterCleaningMinutes: null,
  leafRemovalMinutes: null,
  hardscapeSqft: null,
  overgrown: false,
  debrisLevel: 'light',
  lastServiced: null,
  mow: false,
  hardEdge: false,
  trimShrubs: false,
  blowOff: false,
  mulchBeds: false,
  treatLawn: false,
  gutterClean: false,
  leafRemoval: false,
  crewSize: 1,
  frequency: 'biweekly',
};

export const TAB_SECTIONS = [
  { id: 'services', label: '01 Services' },
  { id: 'condition', label: '02 Condition' },
  { id: 'frequency', label: '03 Service Frequency' },
];

export const DEBRIS_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

export const FREQUENCY_OPTIONS = [
  { value: 'oneTime', label: 'One-Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const CONFIG_FIELDS = [
  ['Crew Members Hourly Rate ($)', 'baseHourlyRate'],
  ['Free Travel Radius (MI)', 'freeRadiusMiles'],
  ['Travel Charge Minimum ($)', 'travelMinimum'],
  ['Shrubs/hr', 'shrubsPerHour'],
  ['Mulch sqft/hr', 'mulchSqftPerHour'],
  ['Gutter mins', 'gutterMinutesPerStory'],
  ['Leaf sqft/hr', 'leafRemovalSqftPerHour'],
  ['Treat sqft/hr', 'treatLawnSqftPerHour'],
  ['Per-Visit Minimum ($)', 'perVisitMinimum'],
  ['Margin %', 'marginPercent'],
];

export const PROPERTY_MEASUREMENT_FIELDS = [
  {
    label: 'Turf Sq Ft',
    key: 'turfSqft',
    req: true,
    hint: 'Required for mow/edge/treat',
    placeholder: 'e.g. 6500',
  },
  {
    label: 'Bed Sq Ft',
    key: 'bedSqft',
    hint: 'Required for mulch estimate',
    placeholder: 'e.g. 400',
  },
  {
    label: 'Shrub Count',
    key: 'shrubsCount',
    hint: 'Required for trim estimate',
    placeholder: 'e.g. 12',
  },
  { label: 'Tree Count', key: 'treesCount', placeholder: 'e.g. 4' },
  { label: 'Hardscape Sq Ft', key: 'hardscapeSqft', placeholder: 'e.g. 800' },
];

export const SERVICE_FIELDS = [
  { label: 'Lawn Mowing', key: 'mow' },
  {
    label: 'Hard Edge',
    sublabel: 'Requires mow selected',
    key: 'hardEdge',
    disabledWithout: 'mow',
  },
  { label: 'Shrub Trimming', key: 'trimShrubs' },
  { label: 'Blow Off / Clean', sublabel: 'Flat time estimate', key: 'blowOff' },
  { label: 'Mulch Beds', key: 'mulchBeds' },
  { label: 'Lawn Treatment', key: 'treatLawn' },
  { label: 'Gutter Cleaning', key: 'gutterClean' },
  { label: 'Leaf Removal', key: 'leafRemoval' },
];

