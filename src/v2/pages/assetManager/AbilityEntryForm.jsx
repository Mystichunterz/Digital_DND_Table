import {
  CATEGORY_OPTIONS,
  KIND_OPTIONS,
  SECTION_OPTIONS,
  TIER_OPTIONS,
  TONE_OPTIONS,
} from "./constants";

const AbilityEntryForm = ({
  abilityForm,
  onUpdateField,
  onSubmit,
  isSaving,
  iconOptions,
}) => (
  <article className="v2-asset-manager-card">
    <header>
      <h2>Ability Entry</h2>
      <p>
        Create or update an ability in `src/v2/data/actions-manifest.json`.
      </p>
    </header>

    <form className="v2-asset-manager-form" onSubmit={onSubmit}>
      <label>
        Name
        <input
          type="text"
          value={abilityForm.name}
          onChange={(event) => onUpdateField("name", event.target.value)}
          placeholder="Divine Smite"
          required
        />
      </label>

      <label>
        ID
        <input
          type="text"
          value={abilityForm.id}
          onChange={(event) => onUpdateField("id", event.target.value)}
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
              onUpdateField("short", event.target.value.toUpperCase())
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
              onUpdateField("keybind", event.target.value.toUpperCase())
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
            onChange={(event) => onUpdateField("category", event.target.value)}
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
            onChange={(event) => onUpdateField("section", event.target.value)}
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
            onChange={(event) => onUpdateField("kind", event.target.value)}
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
            onChange={(event) => onUpdateField("tier", event.target.value)}
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
            onChange={(event) => onUpdateField("tone", event.target.value)}
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
          onChange={(event) => onUpdateField("icon", event.target.value)}
          placeholder="spells/Divine_Smite_Unfaded_Icon.webp"
        />
        <datalist id="v2-asset-manager-icon-keys">
          {iconOptions.map((iconKey) => (
            <option key={iconKey} value={iconKey} />
          ))}
        </datalist>
        <small className="v2-asset-manager-form-hint">
          Optional. Paladin spells without an icon automatically show initials
          in the action tile.
        </small>
      </label>

      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Ability"}
      </button>
    </form>
  </article>
);

export default AbilityEntryForm;
