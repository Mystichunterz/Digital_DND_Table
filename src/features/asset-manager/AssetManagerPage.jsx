import { useCallback, useEffect, useMemo, useState } from "react";
import "./asset-manager.scss";
import { fetchCatalog, saveAbility, uploadIcons } from "@/api/assetManager";
import {
  CATEGORY_TO_GROUP,
  createBlankAbility,
  toAbilityId,
} from "./constants";
import IconUploadCard from "./IconUploadCard";
import AbilityEntryForm from "./AbilityEntryForm";
import ManifestTable from "./ManifestTable";

const AssetManagerPage = () => {
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
    const { manifest: nextManifest, icons: nextIconsPayload } =
      await fetchCatalog();

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
      const result = await uploadIcons(uploadGroup, uploadFiles);
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
          error instanceof Error
            ? error.message
            : "Upload failed unexpectedly.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAbilitySubmit = async (event) => {
    event.preventDefault();
    setIsSavingAbility(true);

    try {
      const result = await saveAbility({
        ...abilityForm,
        id: toAbilityId(abilityForm.id || abilityForm.name),
        keybind: abilityForm.keybind || undefined,
        icon: abilityForm.icon || undefined,
      });

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
    <section className="page asset-manager-page">
      <div className="asset-manager-grid">
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
              ? "asset-manager-status is-error"
              : "asset-manager-status"
          }
        >
          {statusMessage?.text ?? "Use this page with the local API running."}
        </aside>
      </div>
    </section>
  );
};

export default AssetManagerPage;
