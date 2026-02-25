function clampNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function applyRounding(price, strategy) {
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

export function calculateJobEconomics({
  laborRatePerHour,
  fuelCostPerMile,
  overheadPerJobFlat,
  mulchMaterialCost,
  perVisitMinimum,
  baselineServiceHours,
  marginPercent,
  roundingStrategy,
  cadenceMultiplier,
  crewHours,
  miles,
  driveMinutes,
  setupMinutes,
}) {
  const normalizedCrewHours = clampNumber(crewHours);
  const normalizedMiles = clampNumber(miles);
  const normalizedDriveHours = clampNumber(driveMinutes) / 60;
  const normalizedSetupHours = clampNumber(setupMinutes) / 60;
  const normalizedLaborRatePerHour = clampNumber(laborRatePerHour);
  const normalizedFuelCostPerMile = clampNumber(fuelCostPerMile);
  const normalizedOverheadPerJobFlat = clampNumber(overheadPerJobFlat);
  const normalizedMulchMaterialCost = clampNumber(mulchMaterialCost);
  const normalizedPerVisitMinimum = clampNumber(perVisitMinimum);
  const normalizedBaselineServiceHours = clampNumber(baselineServiceHours);
  const derivedBaselineHourly = normalizedBaselineServiceHours > 0
    ? normalizedPerVisitMinimum / normalizedBaselineServiceHours
    : 0;
  const perVisitBaseCost = normalizedBaselineServiceHours > 0
    ? derivedBaselineHourly * normalizedBaselineServiceHours
    : normalizedPerVisitMinimum;
  const normalizedMarginPercent = clampNumber(marginPercent);
  const normalizedCadenceMultiplier = clampNumber(cadenceMultiplier) || 1;
  const marginDecimal = normalizedMarginPercent / 100;
  const marginDenominator = 1 - marginDecimal;

  const totalLaborHours = normalizedCrewHours + normalizedDriveHours + normalizedSetupHours;
  const crewLaborCost = normalizedCrewHours * normalizedLaborRatePerHour;
  const baselineLaborCost = perVisitBaseCost;
  const laborCost = baselineLaborCost + crewLaborCost;
  const fuelCost = normalizedMiles * normalizedFuelCostPerMile;
  const totalCost =
    laborCost
    + fuelCost
    + normalizedOverheadPerJobFlat
    + normalizedMulchMaterialCost;
  const recommendedPriceBase = marginDenominator > 0 ? totalCost / marginDenominator : null;
  const recommendedPriceRaw = recommendedPriceBase != null
    ? recommendedPriceBase * normalizedCadenceMultiplier
    : null;
  const recommendedPrice = recommendedPriceRaw != null
    ? applyRounding(recommendedPriceRaw, roundingStrategy)
    : null;
  const effectiveHourly = totalLaborHours > 0 && recommendedPrice != null
    ? recommendedPrice / totalLaborHours
    : null;

  return {
    laborCost,
    crewLaborCost,
    baselineLaborCost,
    fuelCost,
    totalCost,
    perVisitBaseCost,
    perVisitBaseHourly: derivedBaselineHourly,
    mulchMaterialCost: normalizedMulchMaterialCost,
    recommendedPrice,
    effectiveHourly,
    totalLaborHours,
    isMarginValid: marginDenominator > 0,
  };
}
