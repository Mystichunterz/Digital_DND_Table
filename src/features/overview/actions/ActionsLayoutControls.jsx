import { forwardRef } from "react";

const ActionsLayoutControls = forwardRef(
  (
    {
      isSpellbookOpen,
      onToggleSpellbook,
      onExportLayout,
      onImportLayout,
      onImportFile,
      transferMessage,
    },
    fileInputRef,
  ) => (
    <div className="actions-layout-controls">
      <button
        type="button"
        className={isSpellbookOpen ? "is-active" : ""}
        onClick={onToggleSpellbook}
      >
        Spellbook
      </button>
      <button type="button" onClick={onExportLayout}>
        Export Layout
      </button>
      <button type="button" onClick={onImportLayout}>
        Import Layout
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="actions-layout-file-input"
        onChange={onImportFile}
      />
      <span
        className={
          transferMessage?.type === "error"
            ? "actions-layout-status is-error"
            : "actions-layout-status"
        }
      >
        {transferMessage?.text ?? "Import or export icon layout JSON"}
      </span>
    </div>
  ),
);

ActionsLayoutControls.displayName = "ActionsLayoutControls";

export default ActionsLayoutControls;
