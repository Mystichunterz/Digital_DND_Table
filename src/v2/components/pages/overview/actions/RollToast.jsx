const RollToast = ({ toast }) => {
  if (!toast) {
    return null;
  }

  return (
    <div
      key={toast.id}
      className="v2-actions-roll-toast"
      role="status"
      aria-live="polite"
    >
      <span className="v2-actions-roll-toast-kind">{toast.kind}</span>
      {toast.gwm && <span className="v2-actions-roll-toast-gwm">GWM</span>}
      <code className="v2-actions-roll-toast-command">{toast.command}</code>
    </div>
  );
};

export default RollToast;
