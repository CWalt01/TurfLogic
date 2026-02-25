import { useState, useMemo, useCallback } from "react";
import {
  DEFAULT_CONFIG,
  DEFAULT_INPUTS,
  TAB_SECTIONS,
  DEBRIS_OPTIONS,
  FREQUENCY_OPTIONS,
  CONFIG_FIELDS,
  PROPERTY_MEASUREMENT_FIELDS,
  SERVICE_FIELDS,
} from "./estimator.constants";
import { estimateJob } from "./estimator.engine";
import { ServiceCheckbox, ToggleGroup, Field, NumInput } from "./estimator.ui";


const style = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Courier+Prime:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --parchment: #F4EFE3;
    --parchment-dark: #EAE2CE;
    --parchment-deeper: #DDD3BA;
    --forest: #1C3828;
    --forest-mid: #2E5540;
    --forest-light: #4A7C5E;
    --amber: #C07D2A;
    --amber-light: #E8A84A;
    --rust: #7A3520;
    --charcoal: #2A2018;
    --ink: #3C3020;
    --muted: #7A6E5C;
    --border: #C5B898;
    --border-dark: #A89878;
    --green-accent: #5D9E6E;
    --green-pale: #D4EAD8;
  }

  body {
    background: var(--parchment);
    font-family: 'Courier Prime', monospace;
    color: var(--charcoal);
    min-height: 100vh;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* HEADER */
  .header {
    background: var(--forest);
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 8px,
      rgba(255,255,255,0.015) 8px,
      rgba(255,255,255,0.015) 16px
    );
  }
  .header-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 32px;
    border-bottom: 2px solid var(--forest-light);
  }
  .logo-area {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .logo-icon {
    width: 44px;
    height: 44px;
    background: var(--amber);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .logo-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 900;
    color: var(--parchment);
    letter-spacing: 0.5px;
    line-height: 1;
  }
  .logo-text p {
    font-size: 10px;
    color: var(--forest-light);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 3px;
    font-family: 'Courier Prime', monospace;
  }
  .header-badge {
    background: var(--amber);
    color: var(--forest);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 2px;
    font-family: 'Courier Prime', monospace;
  }

  /* MAIN LAYOUT */
  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 0;
    flex: 1;
    min-height: 0;
  }
  @media (max-width: 900px) {
    .main-layout { grid-template-columns: 1fr; }
  }

  /* LEFT PANEL - FORM */
  .form-panel {
    padding: 28px 32px;
    border-right: 2px solid var(--border);
    overflow-y: auto;
  }

  /* TABS */
  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border-bottom: 2px solid var(--border-dark);
    position: relative;
  }
  .tab-btn {
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    padding: 10px 16px;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .tab-btn:hover { color: var(--forest); }
  .tab-btn.active {
    color: var(--forest);
    border-bottom-color: var(--amber);
  }

  /* SECTION CARDS */
  .section-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 4px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  .section-header {
    background: var(--parchment-dark);
    border-bottom: 1px solid var(--border);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--forest);
    letter-spacing: 0.3px;
  }
  .section-icon {
    font-size: 15px;
  }
  .section-body {
    padding: 16px;
  }

  /* FORM GRID */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-grid.cols-1 { grid-template-columns: 1fr; }

  .field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .field.span-2 { grid-column: span 2; }
  .field.span-3 { grid-column: span 3; }

  label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    font-family: 'Courier Prime', monospace;
  }
  label .req { color: var(--amber); margin-left: 2px; }

  input[type="number"], input[type="text"], select {
    background: var(--parchment);
    border: 1px solid var(--border-dark);
    border-radius: 3px;
    padding: 8px 10px;
    font-family: 'Courier Prime', monospace;
    font-size: 13px;
    color: var(--charcoal);
    width: 100%;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    -webkit-appearance: none;
  }
  input[type="number"]:focus, input[type="text"]:focus, select:focus {
    outline: none;
    border-color: var(--forest-light);
    box-shadow: 0 0 0 2px rgba(74,124,94,0.15);
  }
  input.error { border-color: var(--rust); }
  .field-hint {
    font-size: 10px;
    color: var(--muted);
    font-style: italic;
  }

  /* SELECT WRAPPER */
  .select-wrap {
    position: relative;
  }
  .select-wrap::after {
    content: '▾';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    font-size: 12px;
  }
  .select-wrap select { padding-right: 28px; }

  /* SERVICES CHECKBOXES */
  .services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .service-check {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--parchment);
    border: 1px solid var(--border);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.12s;
    user-select: none;
  }
  .service-check:hover { border-color: var(--forest-light); background: var(--green-pale); }
  .service-check.checked {
    border-color: var(--forest-light);
    background: var(--green-pale);
  }
  .service-check.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .service-check.disabled:hover { background: var(--parchment); border-color: var(--border); }
  .check-box {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-dark);
    border-radius: 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    transition: all 0.12s;
  }
  .service-check.checked .check-box {
    background: var(--forest);
    border-color: var(--forest);
  }
  .check-mark {
    color: var(--parchment);
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }
  .service-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink);
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .service-sublabel {
    font-size: 10px;
    font-weight: 400;
    color: var(--muted);
  }

  /* TOGGLE / RADIO */
  .toggle-group {
    display: flex;
    border: 1px solid var(--border-dark);
    border-radius: 3px;
    overflow: hidden;
  }
  .toggle-btn {
    flex: 1;
    padding: 8px 10px;
    background: white;
    border: none;
    border-right: 1px solid var(--border-dark);
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--muted);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.12s;
  }
  .toggle-btn:last-child { border-right: none; }
  .toggle-btn:hover { background: var(--parchment); }
  .toggle-btn.active {
    background: var(--forest);
    color: var(--parchment);
  }

  /* CONDITION TOGGLES */
  .condition-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .condition-row:last-child { border-bottom: none; padding-bottom: 0; }
  .condition-label { font-size: 12px; font-weight: 700; color: var(--ink); }
  .condition-desc { font-size: 10px; color: var(--muted); margin-top: 1px; }

  /* OVERGROWN SWITCH */
  .switch {
    width: 42px;
    height: 22px;
    background: var(--border-dark);
    border-radius: 11px;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .switch.on { background: var(--forest-light); }
  .switch::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .switch.on::after { left: 23px; }

  /* CONFIG PANEL */
  .config-section {
    margin-top: 8px;
  }
  .config-toggle {
    background: none;
    border: 1px solid var(--border-dark);
    border-radius: 3px;
    padding: 8px 14px;
    width: 100%;
    text-align: left;
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.15s;
  }
  .config-toggle:hover { border-color: var(--forest-light); color: var(--forest); }
  .config-body {
    background: white;
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 3px 3px;
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .config-body label { color: var(--muted); font-size: 9px; letter-spacing: 1px; }
  .config-body input {
    font-size: 12px;
    padding: 6px 8px;
  }

  /* RIGHT PANEL - ESTIMATE */
  .estimate-panel {
    background: var(--forest);
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .estimate-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    background: var(--forest);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .estimate-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--amber-light);
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .price-hero {
    padding: 24px 24px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .price-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--forest-light);
    margin-bottom: 6px;
  }
  .price-big {
    font-family: 'Playfair Display', serif;
    font-size: 56px;
    font-weight: 900;
    color: var(--parchment);
    line-height: 1;
    letter-spacing: -1px;
  }
  .price-big span {
    font-size: 28px;
    color: var(--amber-light);
    vertical-align: super;
    margin-right: 2px;
  }
  .price-cadence {
    font-size: 11px;
    color: var(--forest-light);
    letter-spacing: 1px;
    margin-top: 4px;
  }
  .price-subrow {
    display: flex;
    gap: 16px;
    margin-top: 14px;
  }
  .price-sub {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 3px;
    padding: 8px 12px;
    flex: 1;
  }
  .price-sub-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--forest-light);
    margin-bottom: 4px;
  }
  .price-sub-val {
    font-family: 'Courier Prime', monospace;
    font-size: 16px;
    font-weight: 700;
    color: var(--amber-light);
  }

  /* LINE ITEMS */
  .line-items-section {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .section-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--forest-light);
    margin-bottom: 12px;
  }
  .line-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 7px 0;
    border-bottom: 1px dashed rgba(255,255,255,0.06);
  }
  .line-item:last-child { border-bottom: none; }
  .li-name {
    font-size: 12px;
    color: var(--parchment);
    font-family: 'Courier Prime', monospace;
  }
  .li-detail {
    font-size: 10px;
    color: var(--forest-light);
    margin-top: 1px;
  }
  .li-price {
    font-size: 13px;
    font-weight: 700;
    color: var(--amber-light);
    font-family: 'Courier Prime', monospace;
    white-space: nowrap;
    margin-left: 12px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 0;
    margin-top: 4px;
  }
  .total-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--parchment);
  }
  .total-price {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--amber-light);
  }

  /* MULTIPLIERS */
  .mults-section {
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .mult-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }
  .mult-label { font-size: 11px; color: rgba(255,255,255,0.45); }
  .mult-val {
    font-family: 'Courier Prime', monospace;
    font-size: 11px;
    font-weight: 700;
  }
  .mult-val.neutral { color: rgba(255,255,255,0.3); }
  .mult-val.boosted { color: var(--amber-light); }
  .mult-val.reduced { color: var(--green-accent); }

  /* WARNINGS / NOTES */
  .alerts-section { padding: 16px 24px; }
  .alert {
    border-radius: 3px;
    padding: 10px 12px;
    margin-bottom: 8px;
    font-size: 11px;
    line-height: 1.5;
    font-family: 'Courier Prime', monospace;
  }
  .alert.warn {
    background: rgba(122, 53, 32, 0.3);
    border-left: 3px solid var(--rust);
    color: #F4A88A;
  }
  .alert.note {
    background: rgba(29, 56, 40, 0.6);
    border-left: 3px solid var(--forest-light);
    color: var(--forest-light);
  }
  .alert-icon { margin-right: 6px; }

  /* TIME BREAKDOWN */
  .time-section {
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .time-bar-wrap { margin-bottom: 6px; }
  .time-bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 3px;
  }
  .time-bar {
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
  }
  .time-bar-fill {
    height: 100%;
    background: var(--forest-light);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  /* EMPTY STATE */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    text-align: center;
    gap: 12px;
  }
  .empty-icon { font-size: 48px; opacity: 0.3; }
  .empty-text {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: rgba(255,255,255,0.2);
  }
  .empty-sub { font-size: 11px; color: rgba(255,255,255,0.1); letter-spacing: 1px; }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .estimate-content { animation: fadeUp 0.3s ease forwards; }

  /* FOOTER */
  .footer {
    padding: 8px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.12);
    text-align: center;
  }
`;

// Default Config
export default function App() {
  const [activeTab, setActiveTab] = useState('property');
  const [showConfig, setShowConfig] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);

  // Job inputs state
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const setField = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);
  const {
    zip, travelMiles, turfSqft, bedSqft, treesCount, shrubsCount,
    hardscapeSqft, stories, overgrown, debrisLevel, lastServiced,
    mow, hardEdge, trimShrubs, blowOff, mulchBeds, treatLawn,
    gutterClean, leafRemoval, crewSize, equipmentClass, frequency,
  } = inputs;

  const estimate = useMemo(() => estimateJob(inputs, cfg), [inputs, cfg]);

  const updateCfg = useCallback((k, v) => {
    const num = Number(v);
    if (Number.isNaN(num)) return;
    setCfg(prev => ({ ...prev, [k]: num }));
  }, []);
  const updateCfgStr = useCallback((k, v) => {
    setCfg(prev => ({ ...prev, [k]: v }));
  }, []);

  const hasContent = estimate.lineItems && estimate.lineItems.length > 0;

  const fmt = n => n != null ? `$${Math.round(n).toLocaleString()}` : '-';
  const fmtDec = n => n != null ? `$${n.toFixed(2)}` : '-';

  const multDisplay = (val) => {
    if (!val || val === 1) return { label: 'x1.00', cls: 'neutral' };
    return { label: `x${val.toFixed(2)}`, cls: val > 1 ? 'boosted' : 'reduced' };
  };

  const serviceTimeEntries = estimate.breakdown ? [
    { label: 'Mow', mins: estimate.breakdown.serviceMins.mowMins },
    { label: 'Edge', mins: estimate.breakdown.serviceMins.edgeMins },
    { label: 'Shrubs', mins: estimate.breakdown.serviceMins.shrubMins },
    { label: 'Blow Off', mins: estimate.breakdown.serviceMins.blowMins },
    { label: 'Mulch', mins: estimate.breakdown.serviceMins.mulchMins },
    { label: 'Treatment', mins: estimate.breakdown.serviceMins.treatMins },
    { label: 'Gutters', mins: estimate.breakdown.serviceMins.gutterMins },
    { label: 'Leaf Removal', mins: estimate.breakdown.serviceMins.leafMins },
  ].filter(e => e.mins > 0) : [];

  const maxMins = serviceTimeEntries.reduce((m, e) => Math.max(m, e.mins), 1);

  return (
    <>
      <style>{style}</style>
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="header-inner">
            <div className="logo-area">
              <div className="logo-icon">🌿</div>
              <div className="logo-text">
                <h1>GroundWork Estimator</h1>
                <p>Yard Care · Property Maintenance · Invoice Tool</p>
              </div>
            </div>
            <div className="header-badge">Live Estimate</div>
          </div>
        </header>

        <div className="main-layout">
          {/* FORM PANEL */}
          <div className="form-panel">
            <div className="tabs">
              {TAB_SECTIONS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >{t.label}</button>
              ))}
            </div>

            {/* TAB 1: PROPERTY */}
            {activeTab === 'property' && (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-icon">📍</span>
                    <h3>Location</h3>
                  </div>
                  <div className="section-body">
                    <div className="form-grid">
                      <Field label="ZIP Code" req>
                        <input type="text" value={zip} onChange={e => setField('zip', e.target.value)} placeholder="e.g. 46802" maxLength={5} />
                      </Field>
                      <Field label="Travel Miles" hint="Distance from crew base">
                        <NumInput value={travelMiles} onChange={v => setField('travelMiles', v)} placeholder="e.g. 12" />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <span className="section-icon">🏡</span>
                    <h3>Property Measurements</h3>
                  </div>
                  <div className="section-body">
                    <div className="form-grid">
                      {PROPERTY_MEASUREMENT_FIELDS.map(field => (
                        <Field key={field.key} label={field.label} req={field.req} hint={field.hint}>
                          <NumInput value={inputs[field.key]} onChange={v => setField(field.key, v)} placeholder={field.placeholder} />
                        </Field>
                      ))}
                      <Field label="Stories" hint="Required for gutter estimate">
                        <div className="select-wrap">
                          <select value={stories || ''} onChange={e => setField('stories', e.target.value ? Number(e.target.value) : null)}>
                            <option value="">- Select -</option>
                            <option value="1">1 Story</option>
                            <option value="2">2 Stories</option>
                            <option value="3">3 Stories</option>
                          </select>
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: CONDITION */}
            {activeTab === 'condition' && (
              <div className="section-card">
                <div className="section-header">
                  <span className="section-icon">🌱</span>
                  <h3>Property Condition</h3>
                </div>
                <div className="section-body">
                  <div className="condition-row">
                    <div>
                      <div className="condition-label">Overgrown</div>
                      <div className="condition-desc">Applies recovery minimum & time multiplier</div>
                    </div>
                    <div className={`switch ${overgrown ? 'on' : ''}`} onClick={() => setField('overgrown', !overgrown)} />
                  </div>

                  <div className="condition-row">
                    <div>
                      <div className="condition-label">Debris Level</div>
                      <div className="condition-desc">Affects time multiplier</div>
                    </div>
                  </div>
                  <ToggleGroup
                    options={DEBRIS_OPTIONS}
                    value={debrisLevel}
                    onChange={v => setField('debrisLevel', v)}
                  />

                  <div className="condition-row" style={{ marginTop: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div className="condition-label">Last Serviced</div>
                      <div className="condition-desc">Weeks since last service (informational)</div>
                    </div>
                    <div style={{ width: 80 }}>
                      <NumInput value={lastServiced} onChange={v => setField('lastServiced', v)} placeholder="wks" min={0} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SERVICES */}
            {activeTab === 'services' && (
              <div className="section-card">
                <div className="section-header">
                  <span className="section-icon">🔧</span>
                  <h3>Service Selections</h3>
                </div>
                <div className="section-body">
                  <div className="services-grid">
                    {SERVICE_FIELDS.map(service => (
                      <ServiceCheckbox
                        key={service.key}
                        label={service.label}
                        sublabel={service.sublabel}
                        checked={inputs[service.key]}
                        onChange={v => setField(service.key, v)}
                        disabled={service.disabledWithout ? !inputs[service.disabledWithout] : false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CREW */}
            {activeTab === 'crew' && (
              <>
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-icon">👷</span>
                    <h3>Crew Details</h3>
                  </div>
                  <div className="section-body">
                    <div className="form-grid">
                      <Field label="Crew Size" req hint="Number of workers on site">
                        <NumInput value={crewSize} onChange={v => setField('crewSize', v || 1)} placeholder="2" min={1} />
                      </Field>
                      <Field label="Equipment Class">
                        <div className="select-wrap">
                          <select value={equipmentClass} onChange={e => setField('equipmentClass', e.target.value)}>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial (+productivity)</option>
                          </select>
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <span className="section-icon">📆</span>
                    <h3>Service Frequency</h3>
                  </div>
                  <div className="section-body">
                    <ToggleGroup
                      options={FREQUENCY_OPTIONS}
                      value={frequency}
                      onChange={v => setField('frequency', v)}
                    />
                    <p className="field-hint" style={{ marginTop: 10 }}>
                      {frequency === 'oneTime' && '⚠ One-time surcharge multiplier applied.'}
                      {frequency === 'weekly' && '✓ Subscription discount applied.'}
                      {frequency === 'biweekly' && '✓ Standard subscription rate.'}
                      {frequency === 'monthly' && '↑ Monthly premium applied.'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* CONFIG PANEL */}
            <div className="config-section">
              <button className="config-toggle" onClick={() => setShowConfig(!showConfig)}>
                ⚙ Pricing Configuration
                <span>{showConfig ? '▲ Hide' : '▼ Edit Rates'}</span>
              </button>
              {showConfig && (
                <div className="config-body">
                  {CONFIG_FIELDS.map(([lbl, key]) => (
                    <Field key={key} label={lbl}>
                      <input
                        type="number"
                        value={cfg[key]}
                        onChange={e => updateCfg(key, e.target.value)}
                        step="any"
                      />
                    </Field>
                  ))}
                  <Field label="Rounding Strategy" span={3}>
                    <div className="select-wrap">
                      <select value={cfg.roundingStrategy} onChange={e => updateCfgStr('roundingStrategy', e.target.value)}>
                        <option value="nearest-five">Nearest $5</option>
                        <option value="nearest-dollar">Nearest $1</option>
                        <option value="nearest-ten">Nearest $10</option>
                        <option value="ceil-dollar">Ceiling $1</option>
                        <option value="none">No Rounding</option>
                      </select>
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* ESTIMATE PANEL */}
          <div className="estimate-panel">
            <div className="estimate-header">
              <h2>Live Estimate</h2>
            </div>

            {!hasContent ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-text">No estimate yet</div>
                <div className="empty-sub">Select services to generate a quote</div>
              </div>
            ) : (
              <div className="estimate-content" key={estimate.finalPrice}>
                {/* BIG PRICE */}
                <div className="price-hero">
                  <div className="price-label">Recommended Per-Visit Price</div>
                  <div className="price-big">
                    <span>$</span>{Math.round(estimate.finalPrice || 0).toLocaleString()}
                  </div>
                  <div className="price-cadence">
                    {frequency === 'oneTime' ? 'one-time service' : `per visit · ${frequency}`}
                  </div>
                  <div className="price-subrow">
                    {estimate.monthlyEquivalent && (
                      <div className="price-sub">
                        <div className="price-sub-label">Monthly Est.</div>
                        <div className="price-sub-val">{fmt(estimate.monthlyEquivalent)}</div>
                      </div>
                    )}
                    {estimate.annualEquivalent && (
                      <div className="price-sub">
                        <div className="price-sub-label">
                          {frequency === 'oneTime' ? 'Total' : 'Annual Est.'}
                        </div>
                        <div className="price-sub-val">{fmt(estimate.annualEquivalent)}</div>
                      </div>
                    )}
                    {estimate.breakdown && (
                      <div className="price-sub">
                        <div className="price-sub-label">Crew Hours</div>
                        <div className="price-sub-val">
                          {estimate.breakdown.totalCrewHours.toFixed(1)}h
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* LINE ITEMS */}
                <div className="line-items-section">
                  <div className="section-title">Service Breakdown</div>
                  {estimate.lineItems.map((li, i) => (
                    <div key={i} className="line-item">
                      <div>
                        <div className="li-name">{li.service}</div>
                        <div className="li-detail">
                          {li.minutes ? `${li.minutes} min` : ''}{li.extra ? ` · ${li.extra}` : ''}
                        </div>
                      </div>
                      <div className="li-price">{fmtDec(li.total)}</div>
                    </div>
                  ))}
                  <div className="total-row">
                    <div className="total-label">Est. Final Price</div>
                    <div className="total-price">{fmt(estimate.finalPrice)}</div>
                  </div>
                </div>

                {/* TIME BARS */}
                {serviceTimeEntries.length > 0 && (
                  <div className="time-section">
                    <div className="section-title">Time Distribution</div>
                    {serviceTimeEntries.map(e => (
                      <div key={e.label} className="time-bar-wrap">
                        <div className="time-bar-label">
                          <span>{e.label}</span>
                          <span>{Math.round(e.mins)} min</span>
                        </div>
                        <div className="time-bar">
                          <div className="time-bar-fill" style={{ width: `${(e.mins / maxMins) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* APPLIED MULTIPLIERS */}
                {estimate.breakdown && (
                  <div className="mults-section">
                    <div className="section-title">Applied Multipliers</div>
                    {[
                      ['Condition (Overgrown)', estimate.breakdown.overgownMult],
                      ['Debris Level', estimate.breakdown.debrisMult],
                      ['Equipment Class', estimate.breakdown.equip],
                      ['ZIP / Market', estimate.breakdown.zipMult],
                      ['Cadence', estimate.breakdown.cadenceMult],
                    ].map(([label, val]) => {
                      const d = multDisplay(val);
                      return (
                        <div key={label} className="mult-row">
                          <span className="mult-label">{label}</span>
                          <span className={`mult-val ${d.cls}`}>{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* WARNINGS / NOTES */}
                {(estimate.warnings?.length > 0 || estimate.notes?.length > 0) && (
                  <div className="alerts-section">
                    {estimate.warnings.map((w, i) => (
                      <div key={i} className="alert warn">
                        <span className="alert-icon">⚠</span>{w}
                      </div>
                    ))}
                    {estimate.notes.map((n, i) => (
                      <div key={i} className="alert note">
                        <span className="alert-icon">ℹ</span>{n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="footer">
              Estimates are indicative only · GroundWork Estimator v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



