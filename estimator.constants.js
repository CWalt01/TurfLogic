const OVERGROWN_RECOVERY_MINIMUM = 150;

export const DEFAULT_CONFIG = {
  baseHourlyRate: 55,
  overtimeThresholdHours: 8,
  overtimeMultiplier: 1.5,
  perMileRate: 0.67,
  freeRadiusMiles: 5,
  travelMinimum: 15,
  mowSqftPerHour: 10000,
  edgeSqftPerHour: 3000,
  shrubsPerHour: 8,
  mulchSqftPerHour: 500,
  blowOffMinutes: 15,
  gutterMinutesPerStory: 45,
  leafRemovalSqftPerHour: 4000,
  treatLawnSqftPerHour: 15000,
  overgrownMultiplier: 1.5,
  debrisHeavy: 1.35,
  debrisModerate: 1.15,
  equipmentCommercial: 1.3,
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
  turfSqft: null,
  bedSqft: null,
  treesCount: null,
  shrubsCount: null,
  hardscapeSqft: null,
  stories: null,
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
  crewSize: 2,
  equipmentClass: 'residential',
  frequency: 'biweekly',
};

export const TAB_SECTIONS = [
  { id: 'property', label: '01 Property' },
  { id: 'condition', label: '02 Condition' },
  { id: 'services', label: '03 Services' },
  { id: 'crew', label: '04 Crew' },
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
  ['Base Hourly Rate ($)', 'baseHourlyRate'],
  ['Overtime Threshold (hrs)', 'overtimeThresholdHours'],
  ['Overtime Multiplier', 'overtimeMultiplier'],
  ['$/Mile Travel', 'perMileRate'],
  ['Free Radius (mi)', 'freeRadiusMiles'],
  ['Travel Minimum ($)', 'travelMinimum'],
  ['Mow sqft/hr', 'mowSqftPerHour'],
  ['Edge sqft/hr', 'edgeSqftPerHour'],
  ['Shrubs/hr', 'shrubsPerHour'],
  ['Mulch sqft/hr', 'mulchSqftPerHour'],
  ['Blow Off (mins)', 'blowOffMinutes'],
  ['Gutter mins/story', 'gutterMinutesPerStory'],
  ['Leaf sqft/hr', 'leafRemovalSqftPerHour'],
  ['Treat sqft/hr', 'treatLawnSqftPerHour'],
  ['Overgrown Multiplier', 'overgrownMultiplier'],
  ['Debris Heavy x', 'debrisHeavy'],
  ['Debris Moderate x', 'debrisModerate'],
  ['Commercial Equip x', 'equipmentCommercial'],
  ['Cadence: One-Time x', 'cadenceOneTime'],
  ['Cadence: Weekly x', 'cadenceWeekly'],
  ['Cadence: Biweekly x', 'cadenceBiweekly'],
  ['Cadence: Monthly x', 'cadenceMonthly'],
  ['Per-Visit Minimum ($)', 'perVisitMinimum'],
  ['Overgrown Min ($)', 'overgownRecoveryMinimum'],
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
  { label: 'Lawn Mowing', sublabel: 'Requires turf sq ft', key: 'mow' },
  {
    label: 'Hard Edge',
    sublabel: 'Requires mow selected',
    key: 'hardEdge',
    disabledWithout: 'mow',
  },
  { label: 'Shrub Trimming', sublabel: 'Requires shrub count', key: 'trimShrubs' },
  { label: 'Blow Off / Clean', sublabel: 'Flat time estimate', key: 'blowOff' },
  { label: 'Mulch Beds', sublabel: 'Requires bed sq ft', key: 'mulchBeds' },
  { label: 'Lawn Treatment', sublabel: 'Requires turf sq ft', key: 'treatLawn' },
  { label: 'Gutter Cleaning', sublabel: 'Requires stories', key: 'gutterClean' },
  { label: 'Leaf Removal', sublabel: 'Requires turf sq ft', key: 'leafRemoval' },
];
