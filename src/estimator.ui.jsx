function getFieldSpanClass(span) {
  if (span === 2) return 'span-2';
  if (span === 3) return 'span-3';
  return '';
}

export function ServiceCheckbox({
  label,
  sublabel,
  checked,
  onChange,
  disabled,
  sideNote,
  reserveSideNote = false,
}) {
  const hasSideNoteSlot = reserveSideNote || Boolean(sideNote);

  return (
    <button
      type="button"
      className={`service-check ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${hasSideNoteSlot ? 'with-side-note' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-pressed={checked}
    >
      <div className="check-box">{checked && <span className="check-mark">✓</span>}</div>
      <div className="service-label">
        {label}
        {sublabel && <span className="service-sublabel">{sublabel}</span>}
      </div>
      {hasSideNoteSlot && (
        <span className={`service-side-note ${sideNote ? 'visible' : ''}`}>{sideNote || ''}</span>
      )}
    </button>
  );
}

export function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`toggle-btn ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, req, hint, children, span }) {
  const spanClassName = getFieldSpanClass(span);

  return (
    <div className={`field ${spanClassName}`.trim()}>
      <label>
        {label}
        {req && <span className="req">*</span>}
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export function NumInput({ value, onChange, placeholder, min = 0 }) {
  const displayValue = value == null ? '' : value;

  return (
    <input
      type="number"
      value={displayValue}
      min={min}
      placeholder={placeholder}
      onChange={(event) => {
        const { value: nextValue } = event.target;
        onChange(nextValue === '' ? null : Number(nextValue));
      }}
    />
  );
}

