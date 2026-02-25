import { useState, useMemo, useCallback, useEffect } from "react";
import {
  DEFAULT_CONFIG,
  DEFAULT_INPUTS,
  TAB_SECTIONS,
  FREQUENCY_OPTIONS,
  CONFIG_FIELDS,
  SERVICE_FIELDS,
} from "./estimator.constants";
import { estimateJob } from "./estimator.engine";
import { ServiceCheckbox, ToggleGroup, Field, NumInput } from "./estimator.ui.jsx";
import { calculateJobEconomics } from "./jobEconomics.calc";
import { JobEconomicsCard } from "./JobEconomicsCard.jsx";


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
    font-size: calc(22px + 0.75px);
    flex-shrink: 0;
  }
  .logo-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: calc(22px + 0.75px);
    font-weight: 900;
    color: var(--parchment);
    letter-spacing: 0.5px;
    line-height: 1;
  }
  .logo-text p {
    font-size: calc(10px + 0.75px);
    color: var(--forest-light);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 3px;
    font-family: 'Courier Prime', monospace;
  }
  .header-badge {
    background: var(--amber);
    color: var(--forest);
    font-size: calc(10px + 0.75px);
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
    padding: 12px 18px;
    font-family: 'Courier Prime', monospace;
    font-size: calc(13px + 0.75px);
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    min-height: 44px;
  }
  .tab-btn:hover { color: var(--forest); }
  .tab-btn.active {
    color: var(--forest);
    border-bottom-color: var(--amber);
  }

  /* HOW-IT-WORKS */
  .how-card {
    border-color: var(--forest-light);
    box-shadow: 0 10px 22px rgba(28,56,40,0.08);
  }
  .how-body {
    background:
      radial-gradient(circle at 90% 0%, rgba(232,168,74,0.18), transparent 42%),
      linear-gradient(180deg, #fff 0%, #f8f4ea 100%);
  }
  .how-lead {
    font-size: calc(14px + 0.75px);
    line-height: 1.6;
    color: var(--ink);
    margin-bottom: 14px;
    max-width: 72ch;
  }
  .how-steps {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }
  .how-step {
    border: 1px solid var(--border);
    border-left: 4px solid var(--amber);
    border-radius: 3px;
    background: rgba(255,255,255,0.9);
    padding: 10px 12px;
    font-size: calc(13px + 0.75px);
    line-height: 1.45;
  }
  .how-step strong {
    color: var(--forest);
    display: block;
    margin-bottom: 2px;
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
    font-size: calc(14px + 0.75px);
    font-weight: 700;
    color: var(--forest);
    letter-spacing: 0.3px;
  }
  .section-icon {
    font-size: calc(15px + 0.75px);
  }
  .section-body {
    padding: 16px;
  }
  .condition-body,
  .frequency-body {
    display: grid;
    gap: 12px;
  }
  .condition-body .condition-row {
    padding: 14px 0;
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
    font-size: calc(10px + 0.75px);
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
    font-size: calc(13px + 0.75px);
    color: var(--charcoal);
    width: 100%;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    -webkit-appearance: none;
  }
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input[type="number"]:focus, input[type="text"]:focus, select:focus {
    outline: none;
    border-color: var(--forest-light);
    box-shadow: 0 0 0 2px rgba(74,124,94,0.15);
  }
  input.error { border-color: var(--rust); }
  .field-hint {
    font-size: calc(10px + 0.75px);
    color: var(--muted);
    font-style: italic;
  }
  .readonly-output {
    background: var(--parchment-dark) !important;
    color: var(--ink);
    font-weight: 700;
  }
  .inline-warning {
    color: var(--rust);
    grid-column: 1 / -1;
    margin-top: -4px;
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
    font-size: calc(12px + 0.75px);
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
  .service-check.with-side-note {
    position: relative;
    padding-right: 245px;
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
    font-size: calc(10px + 0.75px);
    font-weight: 700;
    line-height: 1;
  }
  .service-label {
    font-size: calc(12px + 0.75px);
    font-weight: 700;
    color: var(--ink);
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .service-sublabel {
    font-size: calc(10px + 0.75px);
    font-weight: 400;
    color: var(--muted);
  }
  .service-side-note {
    position: absolute;
    right: 12px;
    top: 50%;
    width: 230px;
    transform: translateY(-50%);
    font-size: calc(10px + 0.75px);
    line-height: 1.25;
    color: var(--forest-mid);
    text-align: left;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.12s ease;
  }
  .service-side-note.visible {
    opacity: 1;
  }
  @media (max-width: 1100px) {
    .service-check.with-side-note {
      padding-right: 220px;
    }
    .service-side-note {
      width: 205px;
      font-size: calc(9px + 0.75px);
    }
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
    font-size: calc(11px + 0.75px);
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
  .condition-label { font-size: calc(12px + 0.75px); font-weight: 700; color: var(--ink); }
  .condition-desc { font-size: calc(10px + 0.75px); color: var(--muted); margin-top: 1px; }

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
    font-size: calc(11px + 0.75px);
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
  .config-body label { color: var(--muted); font-size: calc(9px + 0.75px); letter-spacing: 1px; }
  .config-body input {
    font-size: calc(12px + 0.75px);
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
    font-size: calc(13px + 0.75px);
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
    font-size: calc(10px + 0.75px);
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--forest-light);
    margin-bottom: 6px;
  }
  .price-big {
    font-family: 'Playfair Display', serif;
    font-size: calc(56px + 0.75px);
    font-weight: 900;
    color: var(--parchment);
    line-height: 1;
    letter-spacing: -1px;
  }
  .price-big span {
    font-size: calc(28px + 0.75px);
    color: var(--amber-light);
    vertical-align: super;
    margin-right: 2px;
  }
  .price-cadence {
    font-size: calc(11px + 0.75px);
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
    font-size: calc(9px + 0.75px);
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--forest-light);
    margin-bottom: 4px;
  }
  .price-sub-val {
    font-family: 'Courier Prime', monospace;
    font-size: calc(16px + 0.75px);
    font-weight: 700;
    color: var(--amber-light);
  }

  /* LINE ITEMS */
  .line-items-section {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .section-title {
    font-size: calc(9px + 0.75px);
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
    font-size: calc(12px + 0.75px);
    color: var(--parchment);
    font-family: 'Courier Prime', monospace;
  }
  .li-detail {
    font-size: calc(10px + 0.75px);
    color: var(--forest-light);
    margin-top: 1px;
  }
  .li-price {
    font-size: calc(13px + 0.75px);
    font-weight: 700;
    color: var(--amber-light);
    font-family: 'Courier Prime', monospace;
    white-space: nowrap;
    margin-left: 12px;
  }
  .li-price.positive { color: var(--green-accent); }
  .li-price.negative { color: #F4A88A; }

  .market-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
  .market-pill {
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    border-radius: 4px;
    padding: 7px 9px;
  }
  .market-pill-label {
    font-size: calc(9px + 0.75px);
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 3px;
  }
  .market-pill-value {
    font-size: calc(11px + 0.75px);
    font-weight: 700;
    color: var(--amber-light);
    font-family: 'Courier Prime', monospace;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 0;
    margin-top: 4px;
  }
  .total-label {
    font-size: calc(11px + 0.75px);
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--parchment);
  }
  .total-price {
    font-family: 'Playfair Display', serif;
    font-size: calc(22px + 0.75px);
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
  .mult-label { font-size: calc(11px + 0.75px); color: rgba(255,255,255,0.45); }
  .mult-val {
    font-family: 'Courier Prime', monospace;
    font-size: calc(11px + 0.75px);
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
    font-size: calc(11px + 0.75px);
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
    font-size: calc(10px + 0.75px);
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
  .empty-icon { font-size: calc(48px + 0.75px); opacity: 0.3; }
  .empty-text {
    font-family: 'Playfair Display', serif;
    font-size: calc(18px + 0.75px);
    color: rgba(255,255,255,0.2);
  }
  .empty-sub { font-size: calc(11px + 0.75px); color: rgba(255,255,255,0.1); letter-spacing: 1px; }

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
    font-size: calc(9px + 0.75px);
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.12);
    text-align: center;
  }
`;

const SERVICE_CONFIG_KEY_BY_INPUT = {
  trimShrubs: 'shrubsPerHour',
  mulchBeds: 'mulchSqftPerHour',
  treatLawn: 'treatLawnSqftPerHour',
  gutterClean: 'gutterMinutesPerStory',
  leafRemoval: 'leafRemovalSqftPerHour',
};

const SERVICE_SPECIFIC_CONFIG_KEYS = new Set(Object.values(SERVICE_CONFIG_KEY_BY_INPUT));
const SQFT_PER_ACRE = 43560;

// Default Config
export default function App() {
  const MARKET_STORAGE_KEY = "estimator_market_v1";
  const CFG_STORAGE_KEY = "estimator_cfg_v1";
  const initialMarketSettings = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        marketRangeEnabled: false,
        marketLowPerVisit: null,
        marketHighPerVisit: null,
        marketPosition: 'mid',
        marketAdjustEnabled: false,
      };
    }
    try {
      const raw = localStorage.getItem(MARKET_STORAGE_KEY);
      if (!raw) {
        return {
          marketRangeEnabled: false,
          marketLowPerVisit: null,
          marketHighPerVisit: null,
          marketPosition: 'mid',
          marketAdjustEnabled: false,
        };
      }
      const saved = JSON.parse(raw);
      return {
        marketRangeEnabled: typeof saved.marketRangeEnabled === 'boolean' ? saved.marketRangeEnabled : false,
        marketLowPerVisit: saved.marketLowPerVisit == null || typeof saved.marketLowPerVisit === 'number' ? saved.marketLowPerVisit : null,
        marketHighPerVisit: saved.marketHighPerVisit == null || typeof saved.marketHighPerVisit === 'number' ? saved.marketHighPerVisit : null,
        marketPosition: saved.marketPosition === 'low' || saved.marketPosition === 'mid' || saved.marketPosition === 'high' ? saved.marketPosition : 'mid',
        marketAdjustEnabled: typeof saved.marketAdjustEnabled === 'boolean' ? saved.marketAdjustEnabled : false,
      };
    } catch {
      return {
        marketRangeEnabled: false,
        marketLowPerVisit: null,
        marketHighPerVisit: null,
        marketPosition: 'mid',
        marketAdjustEnabled: false,
      };
    }
  }, []);
  const initialCfg = useMemo(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(CFG_STORAGE_KEY);
      if (!raw) return DEFAULT_CONFIG;
      const saved = JSON.parse(raw);
      const merged = { ...DEFAULT_CONFIG, ...saved };
      const allowedRounding = new Set(['nearest-five', 'nearest-dollar', 'nearest-ten']);
      if (!allowedRounding.has(merged.roundingStrategy)) {
        merged.roundingStrategy = 'nearest-five';
      }
      return merged;
    } catch {
      return DEFAULT_CONFIG;
    }
  }, []);
  const [viewTab, setViewTab] = useState('how');
  const [activeTab, setActiveTab] = useState('services');
  const [cfg, setCfg] = useState(initialCfg);
  const [marketRangeEnabled, setMarketRangeEnabled] = useState(initialMarketSettings.marketRangeEnabled);
  const [marketLowPerVisit, setMarketLowPerVisit] = useState(initialMarketSettings.marketLowPerVisit);
  const [marketHighPerVisit, setMarketHighPerVisit] = useState(initialMarketSettings.marketHighPerVisit);
  const [marketPosition, setMarketPosition] = useState(initialMarketSettings.marketPosition);
  const [marketAdjustEnabled, setMarketAdjustEnabled] = useState(initialMarketSettings.marketAdjustEnabled);
  const [crewSizeInput, setCrewSizeInput] = useState(String(DEFAULT_INPUTS.crewSize ?? 1));

  // Job inputs state
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const setField = useCallback((key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);
  const setNonNegativeField = useCallback((key, value) => {
    if (value == null || Number.isNaN(value)) {
      setField(key, null);
      return;
    }
    setField(key, Math.max(0, value));
  }, [setField]);

  const totalAreaUnit = inputs.totalAreaUnit === 'acres' ? 'acres' : 'sqft';
  const totalAreaAcres = useMemo(
    () => Math.max(0, Number(inputs.totalAreaAcres) || 0),
    [inputs.totalAreaAcres]
  );
  const totalAreaSqft = useMemo(() => {
    if (totalAreaUnit === 'acres') {
      return Math.max(0, totalAreaAcres * SQFT_PER_ACRE);
    }
    return Math.max(0, Number(inputs.totalAreaSqft) || 0);
  }, [inputs.totalAreaSqft, totalAreaUnit, totalAreaAcres]);
  const developedAreaSqft = useMemo(
    () => Math.max(0, Number(inputs.developedAreaSqft) || 0),
    [inputs.developedAreaSqft]
  );
  const turfAreaSqft = useMemo(
    () => Math.max(0, totalAreaSqft - developedAreaSqft),
    [totalAreaSqft, developedAreaSqft]
  );
  const developedExceedsTotal = developedAreaSqft > totalAreaSqft;
  const sqftPerManHour = useMemo(
    () => Math.max(0, Number(inputs.sqftPerManHour) || 0),
    [inputs.sqftPerManHour]
  );
  const crewSizeForProductivity = useMemo(
    () => Math.max(1, Number(inputs.crewSize) || 1),
    [inputs.crewSize]
  );
  const effectiveSqftPerHour = useMemo(
    () => sqftPerManHour * crewSizeForProductivity,
    [sqftPerManHour, crewSizeForProductivity]
  );
  const estimatedManHours = useMemo(() => {
    if (effectiveSqftPerHour <= 0) return null;
    return Number((turfAreaSqft / effectiveSqftPerHour).toFixed(2));
  }, [turfAreaSqft, effectiveSqftPerHour]);
  const turfEstimateEnabled = Boolean(inputs.mow || inputs.hardEdge || inputs.blowOff);
  const productivityEntered = sqftPerManHour > 0;
  const turfCalculationsEnabled = turfEstimateEnabled && productivityEntered;

  const {
    travelMiles, overgrown, debrisLevel, lastServiced,
    frequency, fuelCostPerMile, overheadPerJobFlat,
    driveMinutes, setupMinutes, mulchCost, mulchBedMinutes, shrubTrimMinutes, lawnTreatmentMinutes, lawnTreatmentCost,
    gutterCleaningMinutes, leafRemovalMinutes,
  } = inputs;
  const selectedServiceConfigKeys = useMemo(() => {
    const keys = new Set();
    SERVICE_FIELDS.forEach(service => {
      if (inputs[service.key] && SERVICE_CONFIG_KEY_BY_INPUT[service.key]) {
        keys.add(SERVICE_CONFIG_KEY_BY_INPUT[service.key]);
      }
    });
    return keys;
  }, [inputs]);
  const visibleServiceConfigFields = useMemo(
    () => CONFIG_FIELDS.filter(([, key]) => selectedServiceConfigKeys.has(key)),
    [selectedServiceConfigKeys]
  );
  const visibleGeneralConfigFields = useMemo(
    () => CONFIG_FIELDS.filter(([, key]) =>
      !SERVICE_SPECIFIC_CONFIG_KEYS.has(key)
      && key !== 'perVisitMinimum'
      && key !== 'marginPercent'
      && key !== 'baseHourlyRate'
    ),
    []
  );
  const turfSqftForEstimate = useMemo(() => {
    const manualTurfSqft = Math.max(0, Number(inputs.turfSqft) || 0);
    const computedTurfSqft = Math.max(0, Number(turfAreaSqft) || 0);
    if (manualTurfSqft > 0) return manualTurfSqft;
    if (computedTurfSqft > 0) return computedTurfSqft;
    return null;
  }, [inputs.turfSqft, turfAreaSqft]);

  const effectiveInputs = useMemo(() => ({
    ...DEFAULT_INPUTS,
    ...inputs,
    totalAreaUnit,
    turfSqft: (inputs.mow || inputs.hardEdge || inputs.treatLawn || inputs.leafRemoval) ? turfSqftForEstimate : null,
    totalAreaSqft,
    totalAreaAcres,
    developedAreaSqft,
    turfAreaSqft,
    sqftPerManHour,
    estimatedManHours,
    frequency: inputs.frequency,
    overgrown: inputs.overgrown,
    debrisLevel: inputs.debrisLevel,
    travelMiles: inputs.travelMiles,
    zip: inputs.zip,
  }), [inputs, totalAreaUnit, turfAreaSqft, totalAreaSqft, totalAreaAcres, developedAreaSqft, sqftPerManHour, estimatedManHours]);

  const cfgForEngine = useMemo(() => ({ ...cfg, zipDefault: 1 }), [cfg]);
  const estimate = useMemo(() => estimateJob(effectiveInputs, cfgForEngine), [effectiveInputs, cfgForEngine]);
  const enginePrice = estimate.finalPrice;

  const marketRangeValid = useMemo(() => {
    if (!marketRangeEnabled) return false;
    if (marketLowPerVisit == null || marketHighPerVisit == null) return false;
    return marketLowPerVisit <= marketHighPerVisit;
  }, [marketRangeEnabled, marketLowPerVisit, marketHighPerVisit]);

  const marketTargetPrice = useMemo(() => {
    if (!marketRangeValid) return null;
    if (marketPosition === 'low') return marketLowPerVisit;
    if (marketPosition === 'high') return marketHighPerVisit;
    return (marketLowPerVisit + marketHighPerVisit) / 2;
  }, [marketRangeValid, marketPosition, marketLowPerVisit, marketHighPerVisit]);

  const marketAdjustedPrice = useMemo(() => {
    if (marketAdjustEnabled && marketRangeValid && enginePrice != null && marketTargetPrice != null) {
      // Market adjustment is upward-only: never reduce below engine result.
      return Math.max(enginePrice, marketTargetPrice);
    }
    return enginePrice;
  }, [marketAdjustEnabled, marketRangeValid, enginePrice, marketTargetPrice]);

  const marketDifference = useMemo(() => {
    if (!marketRangeValid || enginePrice == null || marketTargetPrice == null) return null;
    return enginePrice - marketTargetPrice;
  }, [marketRangeValid, enginePrice, marketTargetPrice]);

  const marketDifferencePercent = useMemo(() => {
    if (!marketRangeValid || marketTargetPrice == null || marketTargetPrice === 0 || enginePrice == null) return null;
    return ((enginePrice - marketTargetPrice) / marketTargetPrice) * 100;
  }, [marketRangeValid, enginePrice, marketTargetPrice]);

  const marketNotes = useMemo(() => {
    const notes = [];
    if (marketRangeEnabled && !marketRangeValid) {
      notes.push("Market range is invalid. Enter low/high values with low <= high.");
    }
    if (
      marketAdjustEnabled
      && marketRangeValid
      && enginePrice != null
      && marketTargetPrice != null
      && marketTargetPrice > enginePrice
    ) {
      notes.push("Final price adjusted by market target when target is above engine price.");
    }
    if (marketRangeEnabled && !marketAdjustEnabled && marketRangeValid) {
      notes.push("Market comparison only. Engine price remains active.");
    }
    return notes;
  }, [marketRangeEnabled, marketAdjustEnabled, marketRangeValid, enginePrice, marketTargetPrice]);

  const jobEconomicsCrewHours = estimate.breakdown?.totalCrewHours ?? 0;
  const jobEconomicsMiles = travelMiles ?? 0;
  const normalizedDriveMinutes = driveMinutes ?? 0;
  const normalizedSetupMinutes = setupMinutes ?? 0;
  const normalizedMulchCost = inputs.mulchBeds ? (mulchCost ?? 0) : 0;
  const normalizedLawnTreatmentCost = inputs.treatLawn ? (lawnTreatmentCost ?? 0) : 0;
  const normalizedMaterialCost = normalizedMulchCost + normalizedLawnTreatmentCost;
  const formatTimeLabel = (minutesValue) => {
    const safeMinutes = Math.max(0, Number(minutesValue) || 0);
    return `${(safeMinutes / 60).toFixed(2)}h / ${safeMinutes.toFixed(0)}m`;
  };
  const driveTimeLabel = formatTimeLabel(normalizedDriveMinutes);
  const setupTimeLabel = formatTimeLabel(normalizedSetupMinutes);
  const jobEconomics = useMemo(() => calculateJobEconomics({
    laborRatePerHour: cfg.baseHourlyRate,
    fuelCostPerMile,
    overheadPerJobFlat,
    mulchMaterialCost: normalizedMaterialCost,
    perVisitMinimum: cfg.perVisitMinimum,
    baselineServiceHours: estimate.breakdown?.coreServiceHours ?? 0,
    marginPercent: cfg.marginPercent,
    roundingStrategy: cfg.roundingStrategy,
    cadenceMultiplier: estimate.breakdown?.cadenceMult ?? 1,
    crewHours: jobEconomicsCrewHours,
    miles: jobEconomicsMiles,
    driveMinutes: normalizedDriveMinutes,
    setupMinutes: normalizedSetupMinutes,
  }), [
    cfg.baseHourlyRate,
    cfg.perVisitMinimum,
    cfg.marginPercent,
    cfg.roundingStrategy,
    fuelCostPerMile,
    overheadPerJobFlat,
    normalizedMaterialCost,
    estimate.breakdown?.cadenceMult,
    estimate.breakdown?.coreServiceHours,
    jobEconomicsCrewHours,
    jobEconomicsMiles,
    normalizedDriveMinutes,
    normalizedSetupMinutes,
  ]);

  const finalDisplayedPrice = useMemo(() => {
    const economicsRecommendedPrice =
      jobEconomics?.isMarginValid && Number.isFinite(jobEconomics?.recommendedPrice)
        ? jobEconomics.recommendedPrice
        : null;
    if (marketAdjustedPrice == null) return economicsRecommendedPrice;
    if (economicsRecommendedPrice == null) return marketAdjustedPrice;
    return Math.max(marketAdjustedPrice, economicsRecommendedPrice);
  }, [marketAdjustedPrice, jobEconomics]);

  const finalPriceSourceLabel = useMemo(() => {
    const economicsRecommendedPrice =
      jobEconomics?.isMarginValid && Number.isFinite(jobEconomics?.recommendedPrice)
        ? jobEconomics.recommendedPrice
        : null;
    if (
      economicsRecommendedPrice != null
      && (marketAdjustedPrice == null || economicsRecommendedPrice > marketAdjustedPrice)
    ) {
      return 'Job Economics';
    }
    if (marketAdjustEnabled && marketRangeValid && marketTargetPrice != null && enginePrice != null && marketTargetPrice > enginePrice) {
      return 'Market Target';
    }
    return 'Engine Price';
  }, [jobEconomics, marketAdjustedPrice, marketAdjustEnabled, marketRangeValid, marketTargetPrice, enginePrice]);

  useEffect(() => {
    const preventNumberInputStepper = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'number') return;
      if (event.type === 'keydown' && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault();
      }
      if (event.type === 'wheel') {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', preventNumberInputStepper, true);
    document.addEventListener('wheel', preventNumberInputStepper, { capture: true, passive: false });

    return () => {
      document.removeEventListener('keydown', preventNumberInputStepper, true);
      document.removeEventListener('wheel', preventNumberInputStepper, true);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(MARKET_STORAGE_KEY, JSON.stringify({
      marketRangeEnabled,
      marketLowPerVisit,
      marketHighPerVisit,
      marketPosition,
      marketAdjustEnabled,
    }));
  }, [marketRangeEnabled, marketLowPerVisit, marketHighPerVisit, marketPosition, marketAdjustEnabled]);

  const updateCfg = useCallback((k, v) => {
    const num = Number(v);
    if (Number.isNaN(num)) return;
    setCfg(prev => ({ ...prev, [k]: num }));
  }, []);
  const updateCfgStr = useCallback((k, v) => {
    if (k === 'roundingStrategy') {
      const allowedRounding = new Set(['nearest-five', 'nearest-dollar', 'nearest-ten']);
      const next = allowedRounding.has(v) ? v : 'nearest-five';
      setCfg(prev => ({ ...prev, [k]: next }));
      return;
    }
    setCfg(prev => ({ ...prev, [k]: v }));
  }, []);
  const savePricingConfig = useCallback(() => {
    localStorage.setItem(CFG_STORAGE_KEY, JSON.stringify(cfg));
  }, [cfg]);
  const resetPricingConfig = useCallback(() => {
    localStorage.removeItem(CFG_STORAGE_KEY);
    setCfg(DEFAULT_CONFIG);
  }, []);
  const clearMarketSettings = useCallback(() => {
    localStorage.removeItem(MARKET_STORAGE_KEY);
    setMarketRangeEnabled(false);
    setMarketLowPerVisit(null);
    setMarketHighPerVisit(null);
    setMarketPosition('mid');
    setMarketAdjustEnabled(false);
  }, []);
  const trueBaselineReset = useCallback(() => {
    localStorage.removeItem(CFG_STORAGE_KEY);
    localStorage.removeItem(MARKET_STORAGE_KEY);
    setCfg(DEFAULT_CONFIG);
    setInputs({ ...DEFAULT_INPUTS });
    setCrewSizeInput(String(DEFAULT_INPUTS.crewSize ?? 1));
    setActiveTab('services');
    setViewTab('how');
    setMarketRangeEnabled(false);
    setMarketLowPerVisit(null);
    setMarketHighPerVisit(null);
    setMarketPosition('mid');
    setMarketAdjustEnabled(false);
  }, []);

  const hasContent = estimate.lineItems && estimate.lineItems.length > 0;

  const fmt = n => n != null ? `$${Math.round(n).toLocaleString()}` : '-';
  const fmtDec = n => n != null ? `$${n.toFixed(2)}` : '-';
  const fmtSignedDec = n => {
    if (n == null) return '-';
    return `${n > 0 ? '+' : ''}$${n.toFixed(2)}`;
  };
  const fmtWholeNumber = n => Number.isFinite(n) ? Math.round(n).toLocaleString() : '0';
  const getServiceSideNote = (service) => (
    (service.key === 'blowOff' && inputs.blowOff)
    || (service.key === 'hardEdge' && inputs.hardEdge)
      ? 'Note: Adjust time required in 02 Condition tab'
      : ''
  );

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
  const quickCondition = overgrown ? 'overgrown' : (debrisLevel === 'heavy' ? 'heavy' : 'normal');
  const renderEstimatePanel = (fullWidth = false) => (
    <div
      className="estimate-panel"
      style={fullWidth ? { position: 'relative', top: 'auto', height: 'auto', minHeight: 'calc(100vh - 140px)' } : undefined}
    >
      <div className="estimate-header">
        <h2>{fullWidth ? 'Full Estimate' : 'Live Estimate'}</h2>
      </div>

      {!hasContent ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">No estimate yet</div>
          <div className="empty-sub">Select services to generate a quote</div>
        </div>
      ) : (
        <div className="estimate-content" key={finalDisplayedPrice}>
          <div className="price-hero">
            <div className="price-label">Recommended Per-Visit Price</div>
            <div className="price-big">
              <span>$</span>{Math.round(finalDisplayedPrice || 0).toLocaleString()}
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
              <div className="total-price">{fmt(finalDisplayedPrice)}</div>
            </div>
          </div>

          <JobEconomicsCard
            economics={jobEconomics}
            crewHours={jobEconomicsCrewHours}
            miles={jobEconomicsMiles}
            driveTimeLabel={driveTimeLabel}
            setupTimeLabel={setupTimeLabel}
            fmt={fmt}
            fmtDec={fmtDec}
          />

          {fullWidth && (
            <div className="line-items-section">
              <div className="section-title">Turf & Productivity</div>
              <div className="line-item">
                <div className="li-name">Total property area</div>
                <div className="li-price">{fmtWholeNumber(totalAreaSqft)} sq ft</div>
              </div>
              <div className="line-item">
                <div className="li-name">Developed area</div>
                <div className="li-price">{fmtWholeNumber(developedAreaSqft)} sq ft</div>
              </div>
              <div className="line-item">
                <div className="li-name">Estimated turf area</div>
                <div className="li-price">
                  {turfCalculationsEnabled ? `${fmtWholeNumber(turfAreaSqft)} sq ft` : '-'}
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Sq ft per man-hour</div>
                <div className="li-price">
                  {sqftPerManHour > 0 ? fmtWholeNumber(sqftPerManHour) : '-'}
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Effective sq ft/hour (crew-adjusted)</div>
                <div className="li-price">
                  {turfCalculationsEnabled ? fmtWholeNumber(effectiveSqftPerHour) : '-'}
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Estimated man-hours to mow turf</div>
                <div className="li-price">
                  {turfCalculationsEnabled
                    ? (estimatedManHours != null ? estimatedManHours.toFixed(2) : 'Enter a rate to estimate hours')
                    : '-'}
                </div>
              </div>
              {!turfEstimateEnabled && (
                <div className="line-item">
                  <div className="li-detail">
                    Select Lawn Mowing, Hard Edge, or Blow Off / Clean to include turf-area estimate calculations.
                  </div>
                </div>
              )}
              {turfEstimateEnabled && !productivityEntered && (
                <div className="line-item">
                  <div className="li-detail">
                    Enter Square feet per man-hour to apply turf-area calculations.
                  </div>
                </div>
              )}
            </div>
          )}

          {fullWidth && serviceTimeEntries.length > 0 && (
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

          {estimate.breakdown && (
            <div className="mults-section">
              <div className="section-title">Applied Multipliers</div>
              {[
                ['Condition (Overgrown)', estimate.breakdown.overgownMult],
                ['Debris Level', estimate.breakdown.debrisMult],
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

          {marketRangeEnabled && (
            <div className="line-items-section">
              <div className="section-title">Market Comparison</div>
              <div className="market-summary">
                <div className="market-pill">
                  <div className="market-pill-label">Range Status</div>
                  <div className="market-pill-value">{marketRangeValid ? 'Valid' : 'Needs Low/High'}</div>
                </div>
                <div className="market-pill">
                  <div className="market-pill-label">Display Source</div>
                  <div className="market-pill-value">{finalPriceSourceLabel}</div>
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Engine Recommended Price</div>
                <div className="li-price">{fmt(enginePrice)}</div>
              </div>
              <div className="line-item">
                <div className="li-name">Local Market Range (Per Visit)</div>
                <div className="li-price">
                  {marketRangeValid
                    ? `${fmt(marketLowPerVisit)} - ${fmt(marketHighPerVisit)}`
                    : 'Enter low/high'}
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Target Position</div>
                <div className="li-price">{marketPosition === 'mid' ? 'Mid' : marketPosition === 'high' ? 'High' : 'Low'}</div>
              </div>
              <div className="line-item">
                <div className="li-name">Target Market Price</div>
                <div className="li-price">{marketTargetPrice == null ? 'Pending range' : fmt(marketTargetPrice)}</div>
              </div>
              <div className="line-item">
                <div className="li-name">Apply Market Target</div>
                <div className="li-price">{marketAdjustEnabled ? 'On' : 'Off'}</div>
              </div>
              <div className="line-item">
                <div className="li-name">Final Displayed Price</div>
                <div className="li-price">{fmt(finalDisplayedPrice)}</div>
              </div>
              <div className="line-item">
                <div className="li-name">Engine vs Target Delta</div>
                <div className={`li-price ${marketDifference == null ? '' : marketDifference > 0 ? 'positive' : marketDifference < 0 ? 'negative' : ''}`}>
                  {fmtSignedDec(marketDifference)}
                </div>
              </div>
              <div className="line-item">
                <div className="li-name">Engine vs Target Delta (%)</div>
                <div className="li-price">{marketDifferencePercent == null ? '-' : `${marketDifferencePercent.toFixed(1)}%`}</div>
              </div>
              {marketNotes.map((note, i) => (
                <div key={`market-note-${i}`} className="line-item">
                  <div className="li-detail">{note}</div>
                </div>
              ))}
            </div>
          )}

          {(estimate.warnings?.length > 0 || estimate.notes?.length > 0 || marketNotes.length > 0) && (
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
              {marketNotes.map((n, i) => (
                <div key={`mn-${i}`} className="alert note">
                  <span className="alert-icon">ℹ</span>{n}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="footer">
        Estimates are indicative only · TurfLogic v1.0
      </div>
    </div>
  );

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
                <h1>TurfLogic</h1>
                <p>Yard Care · Property Maintenance · Invoice Tool</p>
              </div>
            </div>
            <div className="header-badge">
              {viewTab === 'how'
                ? 'How It Works'
                : viewTab === 'step1'
                  ? 'Step 1 - Services'
                  : viewTab === 'estimate'
                    ? 'Live Estimate'
                    : 'Market Costs'}
            </div>
          </div>
        </header>

        <div className="tabs" style={{ margin: 16, marginBottom: 0 }}>
          <button
            className={`tab-btn ${viewTab === 'how' ? 'active' : ''}`}
            onClick={() => setViewTab('how')}
          >How It Works</button>
          <button
            className={`tab-btn ${viewTab === 'step1' ? 'active' : ''}`}
            onClick={() => setViewTab('step1')}
          >Step 1 - Services</button>
          <button
            className={`tab-btn ${viewTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setViewTab('pricing')}
          >Step 2 - Market Costs</button>
          <button
            className={`tab-btn ${viewTab === 'estimate' ? 'active' : ''}`}
            onClick={() => setViewTab('estimate')}
          >Full Estimate</button>
        </div>

        {viewTab === 'how' && (
          <div className="main-layout">
          <div className="form-panel">
            <div className="section-card how-card">
              <div className="section-header">
                <span className="section-icon">📋</span>
                <h3>How It Works</h3>
              </div>
              <div className="section-body how-body">
                <p className="how-lead">
                  Build your quote left to right. Configure service details first, set your market/labor costs next, and use the Full Estimate tab for the dedicated final view.
                </p>
                <div className="how-steps">
                  <div className="how-step">
                    <strong>1. Step 1 - Services</strong>
                    Select requested services, set property condition, choose service frequency, and adjust service-level multipliers.
                  </div>
                  <div className="how-step">
                    <strong>2. Step 2 - Market Costs</strong>
                    Set labor/travel costs, market range options, and crew settings for your pricing baseline.
                  </div>
                  <div className="how-step">
                    <strong>3. Full Estimate</strong>
                    Open the dedicated estimate-only view to review per-visit price, crew hours, breakdown, and applied multipliers.
                  </div>
                </div>
                <p className="field-hint" style={{ marginTop: 10, fontSize: 12.75 }}>
                  Note: Live Estimate stays visible during Step 1 and Step 2 so updates appear instantly.
                </p>
              </div>
            </div>
          </div>
          {renderEstimatePanel()}
          </div>
        )}

        {viewTab === 'step1' && (
          <div className="main-layout">
          <div className="form-panel">
            <div className="section-card" style={{ marginTop: 14 }}>
              <div className="section-header">
                <span className="section-icon">⚙</span>
                <h3>Step 1</h3>
                <span style={{ fontSize: 12.75, color: 'var(--muted)', fontStyle: 'italic', flex: 1, textAlign: 'center' }}>
                  Note: Fill out all information to get an updated cost estimate
                </span>
              </div>
              <div className="section-body">
                <div className="tabs">
                  {TAB_SECTIONS.map(t => (
                    <button
                      key={t.id}
                      className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(t.id)}
                    >{t.label}</button>
                  ))}
                </div>

                {activeTab === 'condition' && (
                  <div className="section-card" style={{ marginTop: 12 }}>
                    <div className="section-header">
                      <h3>Property Condition</h3>
                    </div>
                    <div className="section-body condition-body">
                      <Field label="Condition" span={2}>
                        <ToggleGroup
                          options={[
                            { value: 'normal', label: 'Normal' },
                            { value: 'heavy', label: 'Heavy' },
                            { value: 'overgrown', label: 'Overgrown' },
                          ]}
                          value={quickCondition}
                          onChange={v => {
                            if (v === 'normal') {
                              setField('overgrown', false);
                              setField('debrisLevel', 'light');
                              return;
                            }
                            if (v === 'heavy') {
                              setField('overgrown', false);
                              setField('debrisLevel', 'heavy');
                              return;
                            }
                            setField('overgrown', true);
                          }}
                        />
                      </Field>
                      {overgrown && (
                        <>
                          <Field label="Overgrown Multiplier" span={2}>
                            <input
                              type="number"
                              value={cfg.overgrownMultiplier}
                              onChange={e => updateCfg('overgrownMultiplier', e.target.value)}
                              step="any"
                            />
                          </Field>
                          <Field label="Overgrown Min Cost Addition ($)" span={2}>
                            <input
                              type="number"
                              value={cfg.overgownRecoveryMinimum}
                              onChange={e => updateCfg('overgownRecoveryMinimum', e.target.value)}
                              step="any"
                            />
                          </Field>
                        </>
                      )}
                      {!overgrown && debrisLevel === 'heavy' && (
                        <Field label="Debris Modifier" span={2}>
                          <input
                            type="number"
                            value={cfg.debrisHeavy}
                            onChange={e => updateCfg('debrisHeavy', e.target.value)}
                            step="any"
                          />
                        </Field>
                      )}
                      <Field label="Clean up Time Required (mins)" span={2}>
                        <NumInput
                          value={cfg.blowOffMinutes}
                          onChange={v => updateCfg('blowOffMinutes', v)}
                          min={0}
                          placeholder="mins"
                        />
                      </Field>
                      <Field label="Time Required for Edge work (mins)" span={2}>
                        <NumInput
                          value={cfg.edgeWorkMinutes}
                          onChange={v => updateCfg('edgeWorkMinutes', v)}
                          min={0}
                          placeholder="mins"
                        />
                      </Field>
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

                {activeTab === 'services' && (
                  <>
                    <div className="form-grid" style={{ marginTop: 12 }}>
                      <Field label="Per-Visit Minimum ($)">
                        <input
                          type="number"
                          value={cfg.perVisitMinimum}
                          onChange={e => updateCfg('perVisitMinimum', e.target.value)}
                          step="any"
                        />
                      </Field>
                      <Field label="Profit Margin">
                        <input
                          type="number"
                          value={cfg.marginPercent}
                          onChange={e => updateCfg('marginPercent', e.target.value)}
                          step="any"
                        />
                      </Field>
                      <Field label="Round Estimate to the nearest:" span={2}>
                        <div className="select-wrap">
                          <select value={cfg.roundingStrategy} onChange={e => updateCfgStr('roundingStrategy', e.target.value)}>
                            <option value="nearest-dollar">Nearest $1</option>
                            <option value="nearest-five">Nearest $5</option>
                            <option value="nearest-ten">Nearest $10</option>
                          </select>
                        </div>
                      </Field>
                    </div>
                    <div className="section-card" style={{ marginTop: 12 }}>
                      <div className="section-header">
                        <span className="section-icon">🔧</span>
                        <h3>Choose the Requested Service(s)</h3>
                      </div>
                      <div className="section-body">
                        <div className="services-grid">
                          {SERVICE_FIELDS.map(service => (
                            <div key={service.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <ServiceCheckbox
                                label={service.label}
                                sublabel={service.sublabel}
                                sideNote={getServiceSideNote(service)}
                                reserveSideNote={service.key === 'blowOff' || service.key === 'hardEdge'}
                                checked={inputs[service.key]}
                                onChange={v => setField(service.key, v)}
                                disabled={service.disabledWithout ? !inputs[service.disabledWithout] : false}
                              />
                              {service.key === 'trimShrubs' && inputs.trimShrubs && (
                                <details>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                                    Shrub Trimming Options
                                  </summary>
                                  <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                                    <Field label="Man hours to complete" hint="Minutes">
                                      <NumInput
                                        value={shrubTrimMinutes}
                                        onChange={v => setNonNegativeField('shrubTrimMinutes', v)}
                                        placeholder="e.g. 45"
                                      />
                                    </Field>
                                  </div>
                                </details>
                              )}
                              {service.key === 'treatLawn' && inputs.treatLawn && (
                                <details>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                                    Lawn Treatment Options
                                  </summary>
                                  <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                                    <Field label="Man hours to complete" hint="Minutes">
                                      <NumInput
                                        value={lawnTreatmentMinutes}
                                        onChange={v => setNonNegativeField('lawnTreatmentMinutes', v)}
                                        placeholder="e.g. 30"
                                      />
                                    </Field>
                                    <Field label="Cost of Materials ($)">
                                      <NumInput
                                        value={lawnTreatmentCost}
                                        onChange={v => setNonNegativeField('lawnTreatmentCost', v)}
                                        placeholder="e.g. 40"
                                      />
                                    </Field>
                                  </div>
                                </details>
                              )}
                              {service.key === 'gutterClean' && inputs.gutterClean && (
                                <details>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                                    Gutter Cleaning Options
                                  </summary>
                                  <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                                    <Field label="Man hours to complete" hint="Minutes">
                                      <NumInput
                                        value={gutterCleaningMinutes}
                                        onChange={v => setNonNegativeField('gutterCleaningMinutes', v)}
                                        placeholder="e.g. 45"
                                      />
                                    </Field>
                                  </div>
                                </details>
                              )}
                              {service.key === 'leafRemoval' && inputs.leafRemoval && (
                                <details>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                                    Leaf Removal Options
                                  </summary>
                                  <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                                    <Field label="Man hours to complete" hint="Minutes">
                                      <NumInput
                                        value={leafRemovalMinutes}
                                        onChange={v => setNonNegativeField('leafRemovalMinutes', v)}
                                        placeholder="e.g. 60"
                                      />
                                    </Field>
                                  </div>
                                </details>
                              )}
                              {service.key === 'mulchBeds' && inputs.mulchBeds && (
                                <details>
                                  <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                                    Mulch Beds Options
                                  </summary>
                                  <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                                    <Field label="Man hours to complete" hint="Minutes">
                                      <NumInput
                                        value={mulchBedMinutes}
                                        onChange={v => setNonNegativeField('mulchBedMinutes', v)}
                                        placeholder="e.g. 60"
                                      />
                                    </Field>
                                    <Field label="Cost of Mulch ($)">
                                      <NumInput
                                        value={mulchCost}
                                        onChange={v => setNonNegativeField('mulchCost', v)}
                                        placeholder="e.g. 75"
                                      />
                                    </Field>
                                  </div>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="section-card" style={{ marginTop: 12 }}>
                          <div className="section-header">
                            <span className="section-icon">T</span>
                            <h3>Turf Area (sq ft)</h3>
                          </div>
                          <div className="section-body">
                            <div className="form-grid">
                              <Field label="Total area unit" span={2}>
                                <ToggleGroup
                                  options={[
                                    { value: 'sqft', label: 'Sq Ft' },
                                    { value: 'acres', label: 'Acres' },
                                  ]}
                                  value={totalAreaUnit}
                                  onChange={v => setField('totalAreaUnit', v)}
                                />
                              </Field>
                              <Field label={totalAreaUnit === 'acres' ? 'Total property area (acres)' : 'Total property area (sq ft)'}>
                                {totalAreaUnit === 'acres' ? (
                                  <NumInput
                                    value={inputs.totalAreaAcres}
                                    onChange={v => setNonNegativeField('totalAreaAcres', v)}
                                    placeholder="e.g. 2.5"
                                    min={0}
                                  />
                                ) : (
                                  <NumInput
                                    value={inputs.totalAreaSqft}
                                    onChange={v => setNonNegativeField('totalAreaSqft', v)}
                                    placeholder="e.g. 12,500"
                                    min={0}
                                  />
                                )}
                              </Field>
                              <Field label="Developed area (buildings/pavement) (sq ft)">
                                <NumInput
                                  value={inputs.developedAreaSqft}
                                  onChange={v => setNonNegativeField('developedAreaSqft', v)}
                                  placeholder="e.g. 3,000"
                                  min={0}
                                />
                              </Field>
                              <Field label="Estimated turf area (sq ft)" span={2}>
                                <input
                                  type="text"
                                  readOnly
                                  className="readonly-output"
                                  value={fmtWholeNumber(turfAreaSqft)}
                                />
                              </Field>
                              {totalAreaUnit === 'acres' && (
                                <span className="field-hint" style={{ gridColumn: '1 / -1' }}>
                                  Converted total area: {fmtWholeNumber(totalAreaSqft)} sq ft
                                </span>
                              )}
                              {developedExceedsTotal && (
                                <span className="field-hint inline-warning">
                                  Developed area exceeds total area. Turf area is clamped to 0.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="section-card" style={{ marginTop: 12 }}>
                          <div className="section-header">
                            <span className="section-icon">P</span>
                            <h3>Productivity (Area per Man-Hour)</h3>
                          </div>
                          <div className="section-body">
                            <div className="form-grid">
                              <Field label="Square feet per man-hour">
                                <NumInput
                                  value={inputs.sqftPerManHour}
                                  onChange={v => setNonNegativeField('sqftPerManHour', v)}
                                  placeholder="6000"
                                  min={0}
                                />
                              </Field>
                              <Field label="Estimated man-hours to mow turf">
                                <input
                                  type="text"
                                  readOnly
                                  className="readonly-output"
                                  value={estimatedManHours != null ? estimatedManHours.toFixed(2) : ''}
                                  placeholder="Enter a rate to estimate hours"
                                />
                              </Field>
                              {sqftPerManHour <= 0 && (
                                <span className="field-hint" style={{ gridColumn: '1 / -1' }}>
                                  Enter a rate to estimate hours
                                </span>
                              )}
                              {sqftPerManHour > 0 && (
                                <span className="field-hint" style={{ gridColumn: '1 / -1' }}>
                                  Uses crew size to adjust productivity.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="section-card" style={{ marginTop: 12 }}>
                          <div className="section-header">
                            <span className="section-icon">👷</span>
                            <h3>Crew Details</h3>
                          </div>
                          <div className="section-body">
                            <div className="form-grid">
                              <Field label="Crew Size" req hint="Number of workers on site">
                                <input
                                  type="number"
                                  value={crewSizeInput}
                                  min={1}
                                  placeholder="1"
                                  onChange={e => {
                                    const nextRaw = e.target.value;
                                    if (nextRaw === '' || /^\d+$/.test(nextRaw)) {
                                      const next = nextRaw.replace(/^0+(?=\d)/, '');
                                      setCrewSizeInput(next);
                                      if (next !== '') {
                                        const parsed = Number(next);
                                        if (parsed >= 1) setField('crewSize', parsed);
                                      }
                                    }
                                  }}
                                  onBlur={() => {
                                    const normalized = crewSizeInput.replace(/^0+(?=\d)/, '');
                                    const parsed = Number(normalized);
                                    if (normalized === '' || Number.isNaN(parsed) || parsed < 1) {
                                      setCrewSizeInput('1');
                                      setField('crewSize', 1);
                                      return;
                                    }
                                    setCrewSizeInput(String(parsed));
                                    setField('crewSize', parsed);
                                  }}
                                />
                              </Field>
                              <Field label="Crew Members Hourly Rate ($)" span={2}>
                                <input
                                  type="number"
                                  value={cfg.baseHourlyRate}
                                  onChange={e => updateCfg('baseHourlyRate', e.target.value)}
                                  step="any"
                                />
                              </Field>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'frequency' && (
                  <div className="section-card" style={{ marginTop: 12 }}>
                    <div className="section-header">
                      <h3>Service Frequency</h3>
                      <span style={{ fontSize: 10.75, color: 'var(--muted)', fontStyle: 'italic' }}>
                        Note - adjust all multipliers for better estimates
                      </span>
                    </div>
                    <div className="section-body frequency-body">
                      <Field label="Frequency" span={2}>
                        <ToggleGroup
                          options={FREQUENCY_OPTIONS}
                          value={frequency}
                          onChange={v => setField('frequency', v)}
                        />
                      </Field>
                      {frequency === 'oneTime' && (
                        <Field label="One-Time Service Charge Multiplier">
                          <input
                            type="number"
                            value={cfg.cadenceOneTime}
                            onChange={e => updateCfg('cadenceOneTime', e.target.value)}
                            step="any"
                          />
                        </Field>
                      )}
                      {frequency === 'weekly' && (
                        <Field label="Weekly Service Charge Multiplier">
                          <input
                            type="number"
                            value={cfg.cadenceWeekly}
                            onChange={e => updateCfg('cadenceWeekly', e.target.value)}
                            step="any"
                          />
                        </Field>
                      )}
                      {frequency === 'biweekly' && (
                        <Field label="Bi-Weekly Service Charge Multiplier">
                          <input
                            type="number"
                            value={cfg.cadenceBiweekly}
                            onChange={e => updateCfg('cadenceBiweekly', e.target.value)}
                            step="any"
                          />
                        </Field>
                      )}
                      {frequency === 'monthly' && (
                        <Field label="Monthly Service Charge Multiplier">
                          <input
                            type="number"
                            value={cfg.cadenceMonthly}
                            onChange={e => updateCfg('cadenceMonthly', e.target.value)}
                            step="any"
                          />
                        </Field>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
            <div className="config-section" style={{ marginTop: 14 }}>
              <button className="config-toggle" onClick={() => setViewTab('pricing')}>
                Step 2 - Market Costs
                <span>Next</span>
              </button>
            </div>
          </div>
          {renderEstimatePanel()}
          </div>
        )}

        {viewTab === 'estimate' && renderEstimatePanel(true)}

        {viewTab === '__legacy__' && (
          <div className="form-panel" style={{ borderRight: 'none', width: '100%' }}>
            <div className="tabs">
              {TAB_SECTIONS.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >{t.label}</button>
              ))}
            </div>

            {activeTab === 'condition' && (
              <div className="section-card">
                <div className="section-header">
                  <h3>Property Condition</h3>
                </div>
                <div className="section-body">
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

            {activeTab === 'services' && (
              <div className="section-card">
                <div className="section-header">
                  <span className="section-icon">🔧</span>
                        <h3>Choose the Requested Service(s)</h3>
                </div>
                <div className="section-body">
                  <div className="services-grid">
                    {SERVICE_FIELDS.map(service => (
                      <div key={service.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ServiceCheckbox
                          label={service.label}
                          sublabel={service.sublabel}
                          sideNote={getServiceSideNote(service)}
                          reserveSideNote={service.key === 'blowOff' || service.key === 'hardEdge'}
                          checked={inputs[service.key]}
                          onChange={v => setField(service.key, v)}
                          disabled={service.disabledWithout ? !inputs[service.disabledWithout] : false}
                        />
                        {service.key === 'trimShrubs' && inputs.trimShrubs && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                              Shrub Trimming Options
                            </summary>
                            <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                              <Field label="Man hours to complete" hint="Minutes">
                                <NumInput
                                  value={shrubTrimMinutes}
                                  onChange={v => setNonNegativeField('shrubTrimMinutes', v)}
                                  placeholder="e.g. 45"
                                />
                              </Field>
                            </div>
                          </details>
                        )}
                        {service.key === 'treatLawn' && inputs.treatLawn && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                              Lawn Treatment Options
                            </summary>
                            <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                              <Field label="Man hours to complete" hint="Minutes">
                                <NumInput
                                  value={lawnTreatmentMinutes}
                                  onChange={v => setNonNegativeField('lawnTreatmentMinutes', v)}
                                  placeholder="e.g. 30"
                                />
                              </Field>
                              <Field label="Cost of Materials ($)">
                                <NumInput
                                  value={lawnTreatmentCost}
                                  onChange={v => setNonNegativeField('lawnTreatmentCost', v)}
                                  placeholder="e.g. 40"
                                />
                              </Field>
                            </div>
                          </details>
                        )}
                        {service.key === 'gutterClean' && inputs.gutterClean && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                              Gutter Cleaning Options
                            </summary>
                            <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                              <Field label="Man hours to complete" hint="Minutes">
                                <NumInput
                                  value={gutterCleaningMinutes}
                                  onChange={v => setNonNegativeField('gutterCleaningMinutes', v)}
                                  placeholder="e.g. 45"
                                />
                              </Field>
                            </div>
                          </details>
                        )}
                        {service.key === 'leafRemoval' && inputs.leafRemoval && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                              Leaf Removal Options
                            </summary>
                            <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                              <Field label="Man hours to complete" hint="Minutes">
                                <NumInput
                                  value={leafRemovalMinutes}
                                  onChange={v => setNonNegativeField('leafRemovalMinutes', v)}
                                  placeholder="e.g. 60"
                                />
                              </Field>
                            </div>
                          </details>
                        )}
                        {service.key === 'mulchBeds' && inputs.mulchBeds && (
                          <details>
                            <summary style={{ cursor: 'pointer', fontSize: 12.75, fontWeight: 700, color: 'var(--forest)' }}>
                              Mulch Beds Options
                            </summary>
                            <div className="form-grid cols-1" style={{ marginTop: 10 }}>
                              <Field label="Man hours to complete" hint="Minutes">
                                <NumInput
                                  value={mulchBedMinutes}
                                  onChange={v => setNonNegativeField('mulchBedMinutes', v)}
                                  placeholder="e.g. 60"
                                />
                              </Field>
                              <Field label="Cost of Mulch ($)">
                                <NumInput
                                  value={mulchCost}
                                  onChange={v => setNonNegativeField('mulchCost', v)}
                                  placeholder="e.g. 75"
                                />
                              </Field>
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {viewTab === 'pricing' && (
          <div className="main-layout">
          <div className="form-panel">
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon">📈</span>
                <h3>Local Market Range</h3>
              </div>
              <div className="section-body">
                <div className="condition-row">
                  <div>
                    <div className="condition-label">Enable market comparison</div>
                    <div className="condition-desc" style={{ fontSize: 11.75 }}>
                      Run a quick google search for a local low and high price range
                    </div>
                  </div>
                  <div className={`switch ${marketRangeEnabled ? 'on' : ''}`} onClick={() => setMarketRangeEnabled(!marketRangeEnabled)} />
                </div>

                {marketRangeEnabled && (
                  <div className="form-grid" style={{ marginTop: 12 }}>
                    <Field label="Market Low ($/service)">
                      <NumInput value={marketLowPerVisit} onChange={setMarketLowPerVisit} placeholder="e.g. 120" />
                    </Field>
                    <Field label="Market High ($/service)">
                      <NumInput value={marketHighPerVisit} onChange={setMarketHighPerVisit} placeholder="e.g. 180" />
                    </Field>
                    <Field label="Target Position" span={2}>
                      <ToggleGroup
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'mid', label: 'Mid' },
                          { value: 'high', label: 'High' },
                        ]}
                        value={marketPosition}
                        onChange={setMarketPosition}
                      />
                    </Field>
                    <Field label="Apply Market Target" span={2}>
                      <div className="condition-row" style={{ borderBottom: 'none', padding: '0' }}>
                        <div>
                          <div className="condition-label">Override final displayed price</div>
                          <div className="condition-desc">Only applies when market range is valid</div>
                        </div>
                        <div className={`switch ${marketAdjustEnabled ? 'on' : ''}`} onClick={() => setMarketAdjustEnabled(!marketAdjustEnabled)} />
                      </div>
                    </Field>
                  </div>
                )}
                <div className="config-section" style={{ marginTop: 12 }}>
                  <button className="config-toggle" onClick={clearMarketSettings}>
                    Clear market settings
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>


            <div className="section-card">
              <div className="section-header">
                <span className="section-icon">⚙</span>
                <h3>Overhead and Travel Costs</h3>
              </div>
              <div className="section-body">
                {visibleServiceConfigFields.length === 0 && (
                  <div className="field-hint" style={{ padding: '0 2px 10px' }}>
                    Be sure to choose services provided in Step - 1
                  </div>
                )}
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <Field label="Travel Miles" hint="Round-trip Distance from Base">
                    <NumInput value={travelMiles} onChange={v => setField('travelMiles', v)} placeholder="e.g. 12" />
                  </Field>
                  <Field label="Fuel Cost Per Mile ($)">
                    <NumInput value={fuelCostPerMile} onChange={v => setNonNegativeField('fuelCostPerMile', v)} placeholder="e.g. 0.67" />
                  </Field>
                  <Field label="Overhead Per Job ($)">
                    <NumInput value={overheadPerJobFlat} onChange={v => setNonNegativeField('overheadPerJobFlat', v)} placeholder="e.g. 25" />
                  </Field>
                  <Field label="Drive Time (Minutes)">
                    <NumInput value={driveMinutes} onChange={v => setNonNegativeField('driveMinutes', v)} placeholder="e.g. 30" />
                  </Field>
                  <Field label="Setup Time (Minutes)">
                    <NumInput value={setupMinutes} onChange={v => setNonNegativeField('setupMinutes', v)} placeholder="e.g. 15" />
                  </Field>
                
                  {visibleServiceConfigFields.map(([lbl, key]) => (
                    <Field key={key} label={lbl}>
                      <input
                        type="number"
                        value={cfg[key]}
                        onChange={e => updateCfg(key, e.target.value)}
                        step="any"
                      />
                    </Field>
                  ))}
                  {visibleGeneralConfigFields.map(([lbl, key]) => (
                    <Field key={key} label={lbl}>
                      <input
                        type="number"
                        value={cfg[key]}
                        onChange={e => updateCfg(key, e.target.value)}
                        step="any"
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </div>
            <div className="config-section" style={{ marginTop: 12 }}>
              <button className="config-toggle" onClick={savePricingConfig}>
                Save pricing configuration
                <span>Save</span>
              </button>
            </div>
            <div className="config-section" style={{ marginTop: 8 }}>
              <button className="config-toggle" onClick={resetPricingConfig}>
                Reset pricing configuration
                <span>Reset</span>
              </button>
            </div>
            <div className="config-section" style={{ marginTop: 8 }}>
              <button className="config-toggle" onClick={trueBaselineReset}>
                True baseline reset
                <span>Reset All</span>
              </button>
            </div>
          </div>
          {renderEstimatePanel()}
          </div>
        )}
      </div>
    </>
  );
}






































