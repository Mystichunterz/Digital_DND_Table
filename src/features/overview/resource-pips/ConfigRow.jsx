const EyeOpenIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 12s3.5 6 9 6c1.7 0 3.2-.4 4.5-1" />
    <path d="M21 12s-1.4-2.5-3.8-4.4" />
    <path d="M14.5 14.5a3 3 0 0 1-4.2-4.2" />
    <path d="M3 3l18 18" />
  </svg>
);

const ConfigRow = ({ iconSrc, label, value, onChange, onToggleVisible }) => {
  const handleInputChange = (event) => {
    const parsed = parseInt(event.target.value, 10);
    onChange(Number.isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  const isVisible = value > 0;

  return (
    <div className="resource-config-row">
      {onToggleVisible ? (
        <button
          type="button"
          className={
            isVisible ? "resource-config-eye" : "resource-config-eye is-hidden"
          }
          onClick={onToggleVisible}
          title={isVisible ? "Hide this resource" : "Show this resource"}
          aria-label={isVisible ? "Hide resource" : "Show resource"}
          aria-pressed={!isVisible}
        >
          {isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </button>
      ) : (
        <span className="resource-config-eye-spacer" aria-hidden="true" />
      )}

      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          className="resource-config-icon"
          draggable={false}
        />
      )}

      <span className="resource-config-label">{label}</span>

      <div className="resource-config-stepper">
        <button
          type="button"
          className="resource-config-step"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={handleInputChange}
          className="resource-config-input"
          aria-label={`${label} maximum`}
        />
        <button
          type="button"
          className="resource-config-step"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ConfigRow;
