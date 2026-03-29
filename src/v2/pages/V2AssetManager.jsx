import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/pages/v2-asset-manager.scss";

const CATEGORY_OPTIONS = [
  { value: "common", label: "Common" },
  { value: "paladin", label: "Paladin" },
  { value: "items", label: "Items" },
  { value: "passives", label: "Passives" },
  { value: "custom", label: "Custom" },
];

const SECTION_OPTIONS = [
  { value: "mobility", label: "Mobility" },
  { value: "offense", label: "Offense" },
  { value: "support", label: "Support" },
];

const KIND_OPTIONS = [
  { value: "action", label: "Action" },
  { value: "bonus", label: "Bonus" },
  { value: "reaction", label: "Reaction" },
  { value: "utility", label: "Utility" },
];

const TIER_OPTIONS = [
  { value: "C", label: "C" },
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
];

const TONE_OPTIONS = [
  { value: "steel", label: "Steel" },
  { value: "red", label: "Red" },
  { value: "gold", label: "Gold" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "green", label: "Green" },
  { value: "neutral", label: "Neutral" },
];

const ICON_GROUP_OPTIONS = [
  { value: "common", label: "Common" },
  { value: "weapons", label: "Weapons" },
  { value: "spells", label: "Spells" },
  { value: "items", label: "Items" },
  { value: "passives", label: "Passives" },
  { value: "custom", label: "Custom" },
];

const CATEGORY_TO_GROUP = {
  common: "common",
  paladin: "spells",
  items: "items",
  passives: "passives",
  custom: "custom",
};

const createBlankAbility = () => ({
  id: "",
  name: "",
  short: "",
  category: "common",
  section: "offense",
  kind: "action",
  tier: "I",
  tone: "steel",
  keybind: "",
  icon: "",
});

const toAbilityId = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const readApiErrorMessage = async (response) => {
  try {
    const payload = await response.json();

    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // fall through to default message
  }

  return `Request failed with status ${response.status}.`;
};

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
              : "Unable to reach local asset manager API. Start npm run dev:assets.",
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
      const response = await fetch("/api/asset-manager/abilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        <article className="v2-asset-manager-card">
          <header>
            <h2>Icon Upload</h2>
            <p>Drop icons into `src/assets/actions/*` through the local API.</p>
          </header>

          <form className="v2-asset-manager-form" onSubmit={handleUploadSubmit}>
            <label>
              Icon Group
              <select
                value={uploadGroup}
                onChange={(event) => setUploadGroup(event.target.value)}
              >
                {ICON_GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Files
              <input
                type="file"
                accept=".webp,.png,.jpg,.jpeg"
                multiple
                onChange={(event) => {
                  const nextFiles = event.target.files
                    ? Array.from(event.target.files)
                    : [];
                  setUploadFiles(nextFiles);
                }}
              />
            </label>

            <button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Icons"}
            </button>
          </form>
        </article>

        <article className="v2-asset-manager-card">
          <header>
            <h2>Ability Entry</h2>
            <p>
              Create or update an ability in
              `src/v2/data/actions-manifest.json`.
            </p>
          </header>

          <form
            className="v2-asset-manager-form"
            onSubmit={handleAbilitySubmit}
          >
            <label>
              Name
              <input
                type="text"
                value={abilityForm.name}
                onChange={(event) =>
                  updateAbilityForm("name", event.target.value)
                }
                placeholder="Divine Smite"
                required
              />
            </label>

            <label>
              ID
              <input
                type="text"
                value={abilityForm.id}
                onChange={(event) =>
                  updateAbilityForm("id", event.target.value)
                }
                placeholder="divine-smite"
              />
            </label>

            <div className="v2-asset-manager-form-row">
              <label>
                Short
                <input
                  type="text"
                  value={abilityForm.short}
                  onChange={(event) =>
                    updateAbilityForm("short", event.target.value.toUpperCase())
                  }
                  placeholder="SM"
                  maxLength={4}
                  required
                />
              </label>

              <label>
                Keybind
                <input
                  type="text"
                  value={abilityForm.keybind}
                  onChange={(event) =>
                    updateAbilityForm(
                      "keybind",
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="Z"
                  maxLength={4}
                />
              </label>
            </div>

            <div className="v2-asset-manager-form-row">
              <label>
                Category
                <select
                  value={abilityForm.category}
                  onChange={(event) =>
                    updateAbilityForm("category", event.target.value)
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Section
                <select
                  value={abilityForm.section}
                  onChange={(event) =>
                    updateAbilityForm("section", event.target.value)
                  }
                >
                  {SECTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="v2-asset-manager-form-row v2-asset-manager-form-row-three">
              <label>
                Kind
                <select
                  value={abilityForm.kind}
                  onChange={(event) =>
                    updateAbilityForm("kind", event.target.value)
                  }
                >
                  {KIND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tier
                <select
                  value={abilityForm.tier}
                  onChange={(event) =>
                    updateAbilityForm("tier", event.target.value)
                  }
                >
                  {TIER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tone
                <select
                  value={abilityForm.tone}
                  onChange={(event) =>
                    updateAbilityForm("tone", event.target.value)
                  }
                >
                  {TONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Icon Key
              <input
                type="text"
                list="v2-asset-manager-icon-keys"
                value={abilityForm.icon}
                onChange={(event) =>
                  updateAbilityForm("icon", event.target.value)
                }
                placeholder="spells/Divine_Smite_Unfaded_Icon.webp"
              />
              <datalist id="v2-asset-manager-icon-keys">
                {iconOptionsForCategory.map((iconKey) => (
                  <option key={iconKey} value={iconKey} />
                ))}
              </datalist>
              <small className="v2-asset-manager-form-hint">
                Optional. Paladin spells without an icon automatically show
                initials in the action tile.
              </small>
            </label>

            <button type="submit" disabled={isSavingAbility}>
              {isSavingAbility ? "Saving..." : "Save Ability"}
            </button>
          </form>
        </article>

        <article className="v2-asset-manager-card v2-asset-manager-library-card">
          <header>
            <h2>Current Manifest</h2>
            <p>
              Version {manifest.version} • {manifest.abilities.length} ability
              {manifest.abilities.length === 1 ? "" : "ies"}
            </p>
          </header>

          {isLoading ? (
            <p className="v2-asset-manager-empty">
              Loading asset manager data...
            </p>
          ) : (
            <div className="v2-asset-manager-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Section</th>
                    <th>Icon</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAbilities.map((ability) => (
                    <tr key={ability.id}>
                      <td>{ability.id}</td>
                      <td>{ability.name}</td>
                      <td>{ability.category}</td>
                      <td>{ability.section}</td>
                      <td>{ability.icon ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

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
