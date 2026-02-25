export function JobEconomicsCard({
  economics,
  crewHours,
  miles,
  driveTimeLabel,
  setupTimeLabel,
  fmt,
  fmtDec,
}) {
  if (!economics) return null;

  return (
    <div className="line-items-section">
      <div className="section-title">Job Economics</div>
      <div className="line-item">
        <div className="li-name">Crew hours (calculated)</div>
        <div className="li-price">{crewHours.toFixed(2)}h</div>
      </div>
      <div className="line-item">
        <div className="li-name">Miles</div>
        <div className="li-price">{miles.toFixed(2)} mi</div>
      </div>
      <div className="line-item">
        <div className="li-name">Drive Time</div>
        <div className="li-price">{driveTimeLabel}</div>
      </div>
      <div className="line-item">
        <div className="li-name">Setup Time</div>
        <div className="li-price">{setupTimeLabel}</div>
      </div>
      <div className="line-item">
        <div className="li-name">Labor cost</div>
        <div className="li-price">{fmtDec(economics.laborCost)}</div>
      </div>
      <div className="line-item">
        <div className="li-name">Fuel cost</div>
        <div className="li-price">{fmtDec(economics.fuelCost)}</div>
      </div>
      {economics.mulchMaterialCost > 0 && (
        <div className="line-item">
          <div className="li-name">Material cost</div>
          <div className="li-price">{fmtDec(economics.mulchMaterialCost)}</div>
        </div>
      )}
      <div className="line-item">
        <div className="li-name">Total cost</div>
        <div className="li-price">{fmtDec(economics.totalCost)}</div>
      </div>
      <div className="line-item">
        <div className="li-name">Recommended Price w/ Added Margin</div>
        <div className="li-price">{economics.recommendedPrice == null ? "-" : fmt(economics.recommendedPrice)}</div>
      </div>
      <div className="line-item">
        <div className="li-name">Effective hourly</div>
        <div className="li-price">{economics.effectiveHourly == null ? "-" : fmtDec(economics.effectiveHourly)}</div>
      </div>
      {!economics.isMarginValid && (
        <div className="line-item">
          <div className="li-detail">Margin must be below 100% to calculate recommended price.</div>
        </div>
      )}
    </div>
  );
}
