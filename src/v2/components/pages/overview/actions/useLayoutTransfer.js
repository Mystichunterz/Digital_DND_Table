import { useRef, useState } from "react";
import { normalizeImportedLayouts } from "./sectionLayout";

const extractLayoutsFromPayload = (parsedJson) => {
  if (parsedJson && typeof parsedJson === "object") {
    if ("sectionLayouts" in parsedJson) return parsedJson.sectionLayouts;
    if ("layouts" in parsedJson) return parsedJson.layouts;
    if ("actionLayouts" in parsedJson) return parsedJson.actionLayouts;
  }

  return parsedJson;
};

export const useLayoutTransfer = ({ sectionLayouts, setSectionLayouts }) => {
  const [transferMessage, setTransferMessage] = useState(null);
  const fileInputRef = useRef(null);

  const exportLayoutAsJson = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[.:]/g, "-");
    const exportPayload = {
      type: "v2-actions-layout",
      version: 2,
      exportedAt: now.toISOString(),
      sectionLayouts,
    };
    const jsonBlob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(jsonBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = `v2-actions-layout-${timestamp}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);
    setTransferMessage({ type: "success", text: "Layout exported." });
  };

  const triggerLayoutImport = () => {
    fileInputRef.current?.click();
  };

  const importLayoutFromJson = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const parsedJson = JSON.parse(rawText);
      const importedLayouts = extractLayoutsFromPayload(parsedJson);

      setSectionLayouts(normalizeImportedLayouts(importedLayouts));
      setTransferMessage({
        type: "success",
        text: `Imported layout from ${file.name}.`,
      });
    } catch {
      setTransferMessage({
        type: "error",
        text: "Import failed. Use a valid layout JSON file.",
      });
    } finally {
      event.target.value = "";
    }
  };

  return {
    transferMessage,
    fileInputRef,
    exportLayoutAsJson,
    triggerLayoutImport,
    importLayoutFromJson,
  };
};
