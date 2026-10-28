const ResistanceArrow = ({ variant = "non-magical", className = "" }) => {
  const variantClass =
    variant === "magical"
      ? "resistance-arrow-magical"
      : "resistance-arrow-non-magical";
  const composedClassName = ["resistance-arrow", variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox="0 0 16 16"
      className={composedClassName}
      role="img"
      aria-label={
        variant === "magical" ? "Magical resistance" : "Non-magical resistance"
      }
    >
      <path
        d="M8 5 L14 11 L8 9 L2 11 Z"
        fill="currentColor"
        stroke="rgba(0, 0, 0, 0.45)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ResistanceArrow;
