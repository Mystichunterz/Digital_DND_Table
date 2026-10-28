const RollToast = ({ toast }) => {
  if (!toast) {
    return null;
  }

  return (
    <div
      key={toast.id}
      className="actions-roll-toast"
      role="status"
      aria-live="polite"
    >
      <span className="actions-roll-toast-kind">{toast.kind}</span>
      {toast.gwm && <span className="actions-roll-toast-gwm">GWM</span>}
      <code className="actions-roll-toast-command">{toast.command}</code>
    </div>
  );
};

export default RollToast;
