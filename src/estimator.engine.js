const FREQUENCY_VISITS_PER_MONTH = {
  oneTime: null,
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
};

function hasNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function nonNegativeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function positiveNumberOrFallback(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function buildLineItem(service, laborMinutes, hourlyRate, marginPercent, extra = '', displayMinutes = laborMinutes) {
  if (laborMinutes <= 0) return null;
  const unitPrice = (laborMinutes / 60) * hourlyRate;

  return {
    service,
    minutes: Math.round(displayMinutes),
    unitPrice,
    total: unitPrice * (1 + marginPercent / 100),
    extra,
  };
}

function buildFixedLineItem(service, displayMinutes, total, extra = '') {
  if (displayMinutes <= 0) return null;
  const safeTotal = Math.max(0, Number(total) || 0);
  return {
    service,
    minutes: Math.round(displayMinutes),
    unitPrice: safeTotal,
    total: safeTotal,
    extra,
  };
}

function calculateLaborCost(totalCrewHours, cfg, crewSize) {
  const overtimeThreshold = nonNegativeNumber(cfg.overtimeThresholdHours);
  const crewMemberHourlyRate = nonNegativeNumber(cfg.baseHourlyRate);
  const overtimeMultiplier = positiveNumberOrFallback(cfg.overtimeMultiplier, 1);
  if (totalCrewHours <= overtimeThreshold) {
    return totalCrewHours * crewMemberHourlyRate * crewSize;
  }

  const regularCost = overtimeThreshold * crewMemberHourlyRate * crewSize;
  const overtimeCost =
    (totalCrewHours - overtimeThreshold) * crewMemberHourlyRate * overtimeMultiplier * crewSize;
  return regularCost + overtimeCost;
}

function getCadenceMultiplier(inputs, cfg) {
  const cadenceMap = {
    oneTime: positiveNumberOrFallback(cfg.cadenceOneTime, 1),
    weekly: positiveNumberOrFallback(cfg.cadenceWeekly, 1),
    biweekly: positiveNumberOrFallback(cfg.cadenceBiweekly, 1),
    monthly: positiveNumberOrFallback(cfg.cadenceMonthly, 1),
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

  if (inputs.mow && !inputs.turfSqft && !hasNumber(inputs.estimatedManHours)) {
    warnings.push('Turf sq ft missing - mow estimate skipped.');
  }
  if (inputs.treatLawn && !inputs.turfSqft && !hasNumber(inputs.lawnTreatmentMinutes)) {
    warnings.push('Turf sq ft missing - lawn treatment estimate skipped.');
  }
  if (inputs.leafRemoval && !inputs.turfSqft && !hasNumber(inputs.leafRemovalMinutes)) {
    warnings.push('Turf sq ft missing - leaf removal estimate skipped.');
  }
  if (inputs.travelMiles == null) {
    notes.push('Travel miles not provided - travel charge excluded.');
  }

  const crewSize = Math.max(1, Number(inputs.crewSize) || 1);
  const overgrownRecoveryMinimum = cfg.overgrownRecoveryMinimum ?? cfg.overgownRecoveryMinimum;
  const crewMemberHourlyRate = nonNegativeNumber(cfg.baseHourlyRate);
  const marginPercent = nonNegativeNumber(cfg.marginPercent);
  const freeRadiusMiles = nonNegativeNumber(cfg.freeRadiusMiles);
  const perMileRate = nonNegativeNumber(cfg.perMileRate);
  const travelMinimum = nonNegativeNumber(cfg.travelMinimum);
  const perVisitMinimum = nonNegativeNumber(cfg.perVisitMinimum);
  const zipMult = positiveNumberOrFallback(cfg.zipDefault, 1);

  const mowSqftPerHour = nonNegativeNumber(cfg.mowSqftPerHour);
  const mulchSqftPerHour = nonNegativeNumber(cfg.mulchSqftPerHour);
  const treatSqftPerHour = nonNegativeNumber(cfg.treatLawnSqftPerHour);
  const leafSqftPerHour = nonNegativeNumber(cfg.leafRemovalSqftPerHour);
  const shrubsPerHour = nonNegativeNumber(cfg.shrubsPerHour);
  const gutterMinutesPerStory = nonNegativeNumber(cfg.gutterMinutesPerStory);

  const mowDisplayMinsFromEstimate =
    inputs.mow && hasNumber(inputs.estimatedManHours)
      ? inputs.estimatedManHours * 60
      : 0;
  const mowDisplayMinsFromSqft =
    inputs.mow && hasNumber(inputs.turfSqft) && mowSqftPerHour > 0
      ? (inputs.turfSqft / mowSqftPerHour) * 60
      : 0;
  const mowDisplayMins = mowDisplayMinsFromEstimate > 0 ? mowDisplayMinsFromEstimate : mowDisplayMinsFromSqft;
  // Engine math uses labor-minutes. Estimated man-hours in the UI are crew-adjusted elapsed hours.
  const mowLaborMins = mowDisplayMinsFromEstimate > 0 ? mowDisplayMins * crewSize : mowDisplayMins;
  const edgeWorkMinutes = Math.max(0, Number(cfg.edgeWorkMinutes) || 0);
  const edgeMins = inputs.hardEdge ? edgeWorkMinutes : 0;
  const shrubMinsFromCount =
    inputs.trimShrubs && hasNumber(inputs.shrubsCount) && shrubsPerHour > 0
      ? (inputs.shrubsCount / shrubsPerHour) * 60
      : 0;
  const shrubMinsManual = inputs.trimShrubs ? Math.max(0, Number(inputs.shrubTrimMinutes) || 0) : 0;
  const shrubMins = shrubMinsFromCount + shrubMinsManual;
  const blowOffMinutes = Math.max(0, Number(cfg.blowOffMinutes) || 0);
  const blowMins = inputs.blowOff ? blowOffMinutes : 0;
  const mulchMinsFromSqft =
    inputs.mulchBeds && hasNumber(inputs.bedSqft) && mulchSqftPerHour > 0
      ? (inputs.bedSqft / mulchSqftPerHour) * 60
      : 0;
  const mulchMinsManual = inputs.mulchBeds ? Math.max(0, Number(inputs.mulchBedMinutes) || 0) : 0;
  const mulchMins = mulchMinsFromSqft + mulchMinsManual;
  const treatMinsFromSqft =
    inputs.treatLawn && hasNumber(inputs.turfSqft) && treatSqftPerHour > 0
      ? (inputs.turfSqft / treatSqftPerHour) * 60
      : 0;
  const treatMinsManual = inputs.treatLawn ? Math.max(0, Number(inputs.lawnTreatmentMinutes) || 0) : 0;
  const treatMins = treatMinsManual > 0 ? treatMinsManual : treatMinsFromSqft;
  const gutterMinsBase = inputs.gutterClean ? gutterMinutesPerStory : 0;
  const gutterMinsManual = inputs.gutterClean ? Math.max(0, Number(inputs.gutterCleaningMinutes) || 0) : 0;
  const gutterMins = gutterMinsManual > 0 ? gutterMinsManual : gutterMinsBase;
  const leafMinsFromSqft =
    inputs.leafRemoval && hasNumber(inputs.turfSqft) && leafSqftPerHour > 0
      ? (inputs.turfSqft / leafSqftPerHour) * 60
      : 0;
  const leafMinsManual = inputs.leafRemoval ? Math.max(0, Number(inputs.leafRemovalMinutes) || 0) : 0;
  const leafMins = leafMinsManual > 0 ? leafMinsManual : leafMinsFromSqft;
  const mulchMaterialCost = inputs.mulchBeds ? nonNegativeNumber(inputs.mulchCost) : 0;
  const lawnTreatmentMaterialCost = inputs.treatLawn ? nonNegativeNumber(inputs.lawnTreatmentCost) : 0;
  const totalMaterialCost = mulchMaterialCost + lawnTreatmentMaterialCost;
  const coreServiceMins = mowDisplayMins + edgeMins + blowMins;
  const coreServiceHours = coreServiceMins / 60;
  const perVisitBaseHourly = coreServiceHours > 0 ? perVisitMinimum / coreServiceHours : 0;
  const perVisitBaseCost = coreServiceHours > 0
    ? perVisitBaseHourly * coreServiceHours
    : perVisitMinimum;
  const mowDisplayHours = mowDisplayMins / 60;
  const mowLineBasePortion = perVisitBaseHourly * mowDisplayHours;
  const mowLineCrewPortion = crewMemberHourlyRate * mowDisplayHours;
  const mowLineTotal = mowLineBasePortion + mowLineCrewPortion;

  const totalRawMins =
    mowLaborMins + edgeMins + shrubMins + blowMins + mulchMins + treatMins + gutterMins + leafMins;

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

  const overgrownMult = inputs.overgrown ? positiveNumberOrFallback(cfg.overgrownMultiplier, 1) : 1;
  const debrisMult =
    inputs.debrisLevel === 'heavy'
      ? positiveNumberOrFallback(cfg.debrisHeavy, 1)
      : inputs.debrisLevel === 'moderate'
        ? positiveNumberOrFallback(cfg.debrisModerate, 1)
        : 1;

  const totalAdjMins = totalRawMins * overgrownMult * debrisMult;
  const totalCrewHours = (totalAdjMins / 60) / crewSize;
  const crewLaborCost = calculateLaborCost(totalCrewHours, cfg, crewSize);
  const baselineLaborCost = perVisitBaseCost;
  const laborCost = baselineLaborCost + crewLaborCost;

  let travelCost = 0;
  const freeRoundTripMiles = freeRadiusMiles * 2;
  if (inputs.travelMiles > freeRoundTripMiles) {
    const rawTravelCost = (inputs.travelMiles - freeRoundTripMiles) * perMileRate;
    travelCost = Math.max(rawTravelCost, travelMinimum);
  }

  const totalCost = laborCost + travelCost + totalMaterialCost;
  const cadenceMult = getCadenceMultiplier(inputs, cfg);

  const basePrice = totalCost * (1 + marginPercent / 100);
  const adjustedPrice = basePrice * zipMult * cadenceMult;
  const roundedPrice = Number.isFinite(adjustedPrice)
    ? applyRounding(adjustedPrice, cfg.roundingStrategy)
    : 0;

  let finalPrice = Math.max(roundedPrice, perVisitMinimum);
  if (inputs.overgrown && finalPrice < overgrownRecoveryMinimum) {
    finalPrice = overgrownRecoveryMinimum;
    warnings.push(`Overgrown recovery minimum applied ($${overgrownRecoveryMinimum}).`);
  }

  const visitsPerMonth = FREQUENCY_VISITS_PER_MONTH[inputs.frequency];
  const monthlyEquivalent = visitsPerMonth ? finalPrice * visitsPerMonth : null;
  const annualEquivalent =
    inputs.frequency === 'oneTime' ? finalPrice : monthlyEquivalent ? monthlyEquivalent * 12 : null;
  const lineItems = [
    buildFixedLineItem(
      'Lawn Mowing',
      mowDisplayMins,
      mowLineTotal,
      inputs.turfSqft ? `${inputs.turfSqft.toLocaleString()} sq ft` : '',
    ),
    buildLineItem('Hard Edge', edgeMins, crewMemberHourlyRate, marginPercent, 'perimeter'),
    buildLineItem(
      'Shrub Trimming',
      shrubMins,
      crewMemberHourlyRate,
      marginPercent,
      inputs.shrubsCount ? `${inputs.shrubsCount} shrubs` : ''
    ),
    buildLineItem('Blow Off / Clean', blowMins, crewMemberHourlyRate, marginPercent, 'flat rate'),
    buildLineItem(
      'Mulch Beds',
      mulchMins,
      crewMemberHourlyRate,
      marginPercent,
      inputs.bedSqft ? `${inputs.bedSqft} sq ft` : ''
    ),
    buildLineItem('Lawn Treatment', treatMins, crewMemberHourlyRate, marginPercent),
    buildLineItem(
      'Gutter Cleaning',
      gutterMins,
      crewMemberHourlyRate,
      marginPercent
    ),
    buildLineItem('Leaf Removal', leafMins, crewMemberHourlyRate, marginPercent),
    travelCost > 0
      ? {
          service: 'Travel Charge',
          minutes: null,
          unitPrice: travelCost,
          total: travelCost,
          extra: `${inputs.travelMiles} mi`,
        }
      : null,
    mulchMaterialCost > 0
      ? {
          service: 'Mulch Material',
          minutes: null,
          unitPrice: mulchMaterialCost,
          total: mulchMaterialCost * (1 + marginPercent / 100),
          extra: 'materials',
        }
      : null,
    lawnTreatmentMaterialCost > 0
      ? {
          service: 'Lawn Treatment Material',
          minutes: null,
          unitPrice: lawnTreatmentMaterialCost,
          total: lawnTreatmentMaterialCost * (1 + marginPercent / 100),
          extra: 'materials',
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
      crewLaborCost,
      baselineLaborCost,
      travelCost,
      mulchMaterialCost,
      lawnTreatmentMaterialCost,
      totalMaterialCost,
      perVisitBaseCost,
      perVisitBaseHourly,
      coreServiceHours,
      totalCost,
      overgrownMult,
      overgownMult: overgrownMult,
      debrisMult,
      cadenceMult,
      zipMult,
      serviceMins: {
        mowMins: mowDisplayMins,
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


