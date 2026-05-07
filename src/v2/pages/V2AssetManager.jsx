import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/pages/v2-asset-manager.scss";
import {
  CATEGORY_TO_GROUP,
  createBlankAbility,
  readApiErrorMessage,
  toAbilityId,
} from "./assetManager/constants";
import IconUploadCard from "./assetManager/IconUploadCard";
import AbilityEntryForm from "./assetManager/AbilityEntryForm";
import ManifestTable from "./assetManager/ManifestTable";

const V2AssetManager = () => {
  const [manifest, setManifest] = useState({ version: 1, abilities: [] });
  const [iconKeys, setIconKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingAbility, setIsSavingAbility] = useState(false);
  const [uploadGroup, setUploadGroup] = useState("spells");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [abilityForm, setAbilityForm] = useState(createBlankAbility);
  const [statusMessage, setStatusMessage] = useState(null);

  const loadCatalog = useCallback(async () => {
    const [manifestResponse, iconsResponse] = await Promise.all([
      fetch("/api/asset-manager/manifest"),
      fetch("/api/asset-manager/icons"),
    ]);

    if (!manifestResponse.ok) {
      throw new Error(await readApiErrorMessage(manifestResponse));
    }

    if (!iconsResponse.ok) {
      throw new Error(await readApiErrorMessage(iconsResponse));
    }

    const nextManifest = await manifestResponse.json();
    const nextIconsPayload = await iconsResponse.json();

    setManifest({
      version: Number(nextManifest?.version ?? 1),
      abilities: Array.isArray(nextManifest?.abilities)
        ? nextManifest.abilities
        : [],
    });
    setIconKeys(
      Array.isArray(nextIconsPayload?.icons) ? nextIconsPayload.icons : [],
    );
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await loadCatalog();

        if (!active) {
          return;
        }

        setStatusMessage({
          type: "success",
          text: "Connected to local asset manager API.",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setStatusMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to reach local asset manager API. Start npm run dev.",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, [loadCatalog]);

  const iconOptionsForCategory = useMemo(() => {
    const preferredGroup = CATEGORY_TO_GROUP[abilityForm.category] ?? "common";
    const preferred = iconKeys.filter((iconKey) =>
      iconKey.startsWith(`${preferredGroup}/`),
    );
    const remaining = iconKeys.filter(
      (iconKey) => !iconKey.startsWith(`${preferredGroup}/`),
    );

    return [...preferred, ...remaining];
  }, [abilityForm.category, iconKeys]);

  const sortedAbilities = useMemo(() => {
    return [...manifest.abilities].sort((left, right) => {
      const categoryComparison = left.category.localeCompare(right.category);

      if (categoryComparison !== 0) {
        return categoryComparison;
      }

      return left.name.localeCompare(right.name);
    });
  }, [manifest.abilities]);

  const handleUploadSubmit = async (event) => {
    event.preventDefault();

    if (uploadFiles.length === 0) {
      setStatusMessage({
        type: "error",
        text: "Select one or more images to upload.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const payload = new FormData();
      payload.append("group", uploadGroup);

      uploadFiles.forEach((file) => {
        payload.append("icons", file);
      });

      const response = await fetch("/api/asset-manager/upload-icons", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }

      const result = await response.json();
      const uploaded = Array.isArray(result?.uploaded) ? result.uploaded : [];

      await loadCatalog();

      if (!abilityForm.icon && uploaded.length > 0) {
        setAbilityForm((currentForm) => ({
          ...currentForm,
          icon: uploaded[0].iconKey,
        }));
      }

      setUploadFiles([]);
      setStatusMessage({
        type: "success",
        text: `Uploaded ${uploaded.length} icon${uploaded.length === 1 ? "" : "s"}.`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Upload failed unexpectedly.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAbilitySubmit = async (event) => {
    event.preventDefault();
    setIsSavingAbility(true);

    try {
      const response = await fetch("/api/asset-manager/abilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...abilityForm,
          id: toAbilityId(abilityForm.id || abilityForm.name),
          keybind: abilityForm.keybind || undefined,
          icon: abilityForm.icon || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }

      const result = await response.json();

      await loadCatalog();

      setAbilityForm((currentForm) => ({
        ...createBlankAbility(),
        category: currentForm.category,
        section: currentForm.section,
        kind: currentForm.kind,
        tier: currentForm.tier,
        tone: currentForm.tone,
      }));
      setStatusMessage({
        type: "success",
        text: `${result.mode === "updated" ? "Updated" : "Added"} ability ${result.ability.id}.`,
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ability save failed unexpectedly.",
      });
    } finally {
      setIsSavingAbility(false);
    }
  };

  const updateAbilityForm = (field, value) => {
    setAbilityForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  useEffect(() => {
    const suggestedGroup = CATEGORY_TO_GROUP[abilityForm.category];

    if (suggestedGroup) {
      setUploadGroup(suggestedGroup);
    }
  }, [abilityForm.category]);

  return (
    <section className="v2-page v2-asset-manager-page">
      <div className="v2-asset-manager-grid">
        <IconUploadCard
          uploadGroup={uploadGroup}
          onChangeUploadGroup={setUploadGroup}
          onChangeFiles={setUploadFiles}
          onSubmit={handleUploadSubmit}
          isUploading={isUploading}
        />

        <AbilityEntryForm
          abilityForm={abilityForm}
          onUpdateField={updateAbilityForm}
          onSubmit={handleAbilitySubmit}
          isSaving={isSavingAbility}
          iconOptions={iconOptionsForCategory}
        />

        <ManifestTable
          manifest={manifest}
          sortedAbilities={sortedAbilities}
          isLoading={isLoading}
        />

        <aside
          className={
            statusMessage?.type === "error"
              ? "v2-asset-manager-status is-error"
              : "v2-asset-manager-status"
          }
        >
          {statusMessage?.text ?? "Use this page with the local API running."}
        </aside>
      </div>
    </section>
  );
};

export default V2AssetManager;
