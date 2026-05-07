import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  formulaRange,
  parseFormulaTerms,
  substituteTokens,
} from "../../../data/formulas";

const buildBreakdownTerms = (rawRows, tokenValues) => {
  const terms = [];
  rawRows.forEach((row) => {
    const rowTerms = parseFormulaTerms(row.formula ?? "", tokenValues);
    rowTerms.forEach((term) => {
      if (term.kind === "dice") {
        terms.push({ ...term, damageType: row.type });
      } else {
        terms.push(term);
      }
    });
  });
  return terms;
};

const DamageBreakdownPopup = ({ anchorRef, rawRows, tokenValues }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false });

  useLayoutEffect(() => {
    if (!anchorRef?.current || !popupRef.current) return;
    const padding = 10;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const width = popupRef.current.offsetWidth;
    const height = popupRef.current.offsetHeight;
    let top = anchorRect.bottom + 10;
    let left = anchorRect.left;

    if (left + width > window.innerWidth - padding) {
      left = Math.max(window.innerWidth - width - padding, padding);
    }
    if (top + height > window.innerHeight - padding) {
      top = Math.max(anchorRect.top - height - 10, padding);
    }

    setPosition({ top, left, ready: true });
  }, [anchorRef]);

  const terms = useMemo(
    () => buildBreakdownTerms(rawRows, tokenValues),
    [rawRows, tokenValues],
  );

  const total = useMemo(
    () =>
      rawRows.reduce(
        (acc, row) => {
          const range = formulaRange(
            substituteTokens(row.formula ?? "", tokenValues),
          );
          return { min: acc.min + range.min, max: acc.max + range.max };
        },
        { min: 0, max: 0 },
      ),
    [rawRows, tokenValues],
  );

  if (terms.length === 0) return null;

  const root =
    typeof document !== "undefined" ? document.getElementById("root") : null;
  if (!root) return null;

  const totalLabel =
    total.min === total.max ? `${total.min}` : `${total.min}~${total.max}`;

  return ReactDOM.createPortal(
    <div
      className="spell-damage-breakdown"
      ref={popupRef}
      style={{
        top: position.top,
        left: position.left,
        visibility: position.ready ? "visible" : "hidden",
      }}
      role="tooltip"
    >
      <p className="spell-damage-breakdown-line">
        <span className="spell-damage-breakdown-label">Damage Roll: </span>
        {terms.map((term, index) => {
          const leading =
            index === 0
              ? term.sign === "-"
                ? "- "
                : ""
              : ` ${term.sign} `;

          if (term.kind === "dice") {
            return (
              <Fragment key={index}>
                {leading}
                <span className="spell-damage-breakdown-dice">{term.text}</span>
                {term.damageType && (
                  <span className="spell-damage-breakdown-meta">
                    {" "}
                    ({term.damageType})
                  </span>
                )}
              </Fragment>
            );
          }

          if (term.kind === "token") {
            return (
              <Fragment key={index}>
                {leading}
                {term.value}
                <span className="spell-damage-breakdown-meta">
                  {" "}
                  ({term.label})
                </span>
              </Fragment>
            );
          }

          return (
            <Fragment key={index}>
              {leading}
              {term.value}
            </Fragment>
          );
        })}
        {" = "}
        <span className="spell-damage-breakdown-total">{totalLabel}</span>
      </p>
    </div>,
    root,
  );
};

export default DamageBreakdownPopup;
