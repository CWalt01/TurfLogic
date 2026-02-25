const FREQUENCY_VISITS_PER_MONTH = {
  oneTime: null,
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
};

function hasNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function buildLineItem(service, minutes, hourlyRate, marginPercent, extra = '') {
  if (minutes <= 0) return null;
  const unitPrice = (minutes / 60) * hourlyRate;

  return {
    service,
    minutes: Math.round(minutes),
    unitPrice,
    total: unitPrice * (1 + marginPercent / 100),
    extra,
  };
}

function calculateLaborCost(totalCrewHours, cfg, crewSize) {
  const overtimeThreshold = cfg.overtimeThresholdHours;
  if (totalCrewHours <= overtimeThreshold) {
    return totalCrewHours * cfg.baseHourlyRate * crewSize;
  }

  const regularCost = overtimeThreshold * cfg.baseHourlyRate * crewSize;
  const overtimeCost =
    (totalCrewHours - overtimeThreshold) * cfg.baseHourlyRate * cfg.overtimeMultiplier * crewSize;
  return regularCost + overtimeCost;
}

function getCadenceMultiplier(inputs, cfg) {
  const cadenceMap = {
    oneTime: cfg.cadenceOneTime,
    weekly: cfg.cadenceWeekly,
    biweekly: cfg.cadenceBiweekly,
    monthly: cfg.cadenceMonthly,
  };
  return cadenceMap[inputs.frequency] || 1;
}

export function applyRounding(price, strategy) {
  if (!price) return price;

  switch (strategy) {
    case 'nearest-dollar':
      return Math.round(price);
    case 'nearest-five':
      return Math.round(price / 5) * 5;
    case 'nearest-ten':
      return Math.round(price / 10) * 10;
    case 'ceil-dollar':
      return Math.ceil(price);
    default:
      return price;
  }
}

export function estimateJob(inputs, cfg) {
  const warnings = [];
  const notes = [];

  if (inputs.hardEdge && !inputs.mow) {
    warnings.push('Hard edge selected without mow - hard edge will be ignored.');
  }
  if (inputs.mow && !inputs.turfSqft) {
    warnings.push('Turf sq ft missing - mow and edge estimates skipped.');
  }
  if (inputs.treatLawn && !inputs.turfSqft) {
    warnings.push('Turf sq ft missing - lawn treatment estimate skipped.');
  }
  if (inputs.leafRemoval && !inputs.turfSqft) {
    warnings.push('Turf sq ft missing - leaf removal estimate skipped.');
  }
  if (inputs.mulchBeds && !inputs.bedSqft) {
    warnings.push('Bed sq ft missing - mulch estimate skipped.');
  }
  if (inputs.travelMiles == null) {
    notes.push('Travel miles not provided - travel charge excluded.');
  }
  if (inputs.gutterClean && !inputs.stories) {
    notes.push('Stories not specified - defaulting to 1 story for gutter estimate.');
  }

  const equipmentMultiplier = inputs.equipmentClass === 'commercial' ? cfg.equipmentCommercial : 1;
  const crewSize = Math.max(1, Number(inputs.crewSize) || 1);
  const overgrownRecoveryMinimum = cfg.overgrownRecoveryMinimum ?? cfg.overgownRecoveryMinimum;

  const mowMins =
    inputs.mow && hasNumber(inputs.turfSqft)
      ? (inputs.turfSqft / cfg.mowSqftPerHour) * 60 / equipmentMultiplier
      : 0;
  const edgeMins =
    inputs.hardEdge && inputs.mow && hasNumber(inputs.turfSqft)
      ? (inputs.turfSqft / cfg.edgeSqftPerHour) * 60 / equipmentMultiplier
      : 0;
  const shrubMins =
    inputs.trimShrubs && hasNumber(inputs.shrubsCount)
      ? (inputs.shrubsCount / cfg.shrubsPerHour) * 60
      : 0;
  const blowMins = inputs.blowOff ? cfg.blowOffMinutes : 0;
  const mulchMins =
    inputs.mulchBeds && hasNumber(inputs.bedSqft)
      ? (inputs.bedSqft / cfg.mulchSqftPerHour) * 60
      : 0;
  const treatMins =
    inputs.treatLawn && hasNumber(inputs.turfSqft)
      ? (inputs.turfSqft / cfg.treatLawnSqftPerHour) * 60
      : 0;
  const gutterMins = inputs.gutterClean ? (inputs.stories || 1) * cfg.gutterMinutesPerStory : 0;
  const leafMins =
    inputs.leafRemoval && hasNumber(inputs.turfSqft)
      ? (inputs.turfSqft / cfg.leafRemovalSqftPerHour) * 60
      : 0;

  const totalRawMins =
    mowMins + edgeMins + shrubMins + blowMins + mulchMins + treatMins + gutterMins + leafMins;

  if (totalRawMins === 0) {
    return {
      lineItems: [],
      finalPrice: null,
      monthlyEquivalent: null,
      annualEquivalent: null,
      breakdown: null,
      warnings: [...warnings, 'No services selected or all estimates skipped.'],
      notes,
    };
  }

  const overgrownMult = inputs.overgrown ? cfg.overgrownMultiplier : 1;
  const debrisMult =
    inputs.debrisLevel === 'heavy'
      ? cfg.debrisHeavy
      : inputs.debrisLevel === 'moderate'
        ? cfg.debrisModerate
        : 1;

  const totalAdjMins = totalRawMins * overgrownMult * debrisMult;
  const totalCrewHours = (totalAdjMins / 60) / crewSize;
  const laborCost = calculateLaborCost(totalCrewHours, cfg, crewSize);

  let travelCost = 0;
  if (inputs.travelMiles > cfg.freeRadiusMiles) {
    const rawTravelCost = (inputs.travelMiles - cfg.freeRadiusMiles) * cfg.perMileRate;
    travelCost = Math.max(rawTravelCost, cfg.travelMinimum);
  }

  const totalCost = laborCost + travelCost;
  const zipMult = cfg.zipDefault;
  const cadenceMult = getCadenceMultiplier(inputs, cfg);

  if (inputs.frequency === 'oneTime') {
    notes.push('One-time visit surcharge applied. Subscription pricing not available.');
  }

  const basePrice = totalCost * (1 + cfg.marginPercent / 100);
  const adjustedPrice = basePrice * zipMult * cadenceMult;
  const roundedPrice = applyRounding(adjustedPrice, cfg.roundingStrategy);

  let finalPrice = Math.max(roundedPrice, cfg.perVisitMinimum);
  if (inputs.overgrown && finalPrice < overgrownRecoveryMinimum) {
    finalPrice = overgrownRecoveryMinimum;
    warnings.push(`Overgrown recovery minimum applied ($${overgrownRecoveryMinimum}).`);
  }

  const visitsPerMonth = FREQUENCY_VISITS_PER_MONTH[inputs.frequency];
  const monthlyEquivalent = visitsPerMonth ? finalPrice * visitsPerMonth : null;
  const annualEquivalent =
    inputs.frequency === 'oneTime' ? finalPrice : monthlyEquivalent ? monthlyEquivalent * 12 : null;

  const lineItems = [
    buildLineItem(
      'Lawn Mowing',
      mowMins,
      cfg.baseHourlyRate,
      cfg.marginPercent,
      inputs.turfSqft ? `${inputs.turfSqft.toLocaleString()} sq ft` : ''
    ),
    buildLineItem('Hard Edge', edgeMins, cfg.baseHourlyRate, cfg.marginPercent, 'perimeter'),
    buildLineItem(
      'Shrub Trimming',
      shrubMins,
      cfg.baseHourlyRate,
      cfg.marginPercent,
      inputs.shrubsCount ? `${inputs.shrubsCount} shrubs` : ''
    ),
    buildLineItem('Blow Off / Clean', blowMins, cfg.baseHourlyRate, cfg.marginPercent, 'flat rate'),
    buildLineItem(
      'Mulch Beds',
      mulchMins,
      cfg.baseHourlyRate,
      cfg.marginPercent,
      inputs.bedSqft ? `${inputs.bedSqft} sq ft` : ''
    ),
    buildLineItem('Lawn Treatment', treatMins, cfg.baseHourlyRate, cfg.marginPercent),
    buildLineItem(
      'Gutter Cleaning',
      gutterMins,
      cfg.baseHourlyRate,
      cfg.marginPercent,
      `${inputs.stories || 1} ${inputs.stories === 1 ? 'story' : 'stories'}`
    ),
    buildLineItem('Leaf Removal', leafMins, cfg.baseHourlyRate, cfg.marginPercent),
    travelCost > 0
      ? {
          service: 'Travel Charge',
          minutes: null,
          unitPrice: travelCost,
          total: travelCost,
          extra: `${inputs.travelMiles} mi`,
        }
      : null,
  ].filter(Boolean);

  return {
    lineItems,
    finalPrice,
    monthlyEquivalent,
    annualEquivalent,
    breakdown: {
      totalRawMins,
      totalAdjMins,
      totalCrewHours,
      laborCost,
      travelCost,
      totalCost,
      overgrownMult,
      overgownMult: overgrownMult,
      debrisMult,
      cadenceMult,
      zipMult,
      equip: equipmentMultiplier,
      serviceMins: {
        mowMins,
        edgeMins,
        shrubMins,
        blowMins,
        mulchMins,
        treatMins,
        gutterMins,
        leafMins,
      },
    },
    warnings,
    notes,
  };
}
