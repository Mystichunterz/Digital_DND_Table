import PaladinCrest from "../../assets/popups/crests/Class_Paladin_Vengeance_Badge_Icon.png";
import SorcererCrest from "../../assets/popups/features/120px-Draconic_Resilience_Icon.webp.png";
import PreparedGlyph from "../../assets/popups/spellbook/Prepared_Spells_Icon.webp";
import CantripsGlyph from "../../assets/popups/spellbook/Cantrips_Icon.png";
import Tier1Glyph from "../../assets/popups/spellbook/Tier_1.png";
import Tier2Glyph from "../../assets/popups/spellbook/Tier_2.png";
import Tier3Glyph from "../../assets/popups/spellbook/Tier_3.png";
import Tier4Glyph from "../../assets/popups/spellbook/Tier_4.png";
import Tier5Glyph from "../../assets/popups/spellbook/Tier_5.png";
import Tier6Glyph from "../../assets/popups/spellbook/Tier_6.png";

export const SECTION_GLYPHS = {
  "class-action": { kind: "dot" },
  "spell-at-will": { kind: "infinity" },
  cantrip: { kind: "image", src: CantripsGlyph },
  prepared: { kind: "image", src: PreparedGlyph },
  metamagic: { kind: "drop" },
  "tier-1": { kind: "image", src: Tier1Glyph },
  "tier-2": { kind: "image", src: Tier2Glyph },
  "tier-3": { kind: "image", src: Tier3Glyph },
  "tier-4": { kind: "image", src: Tier4Glyph },
  "tier-5": { kind: "image", src: Tier5Glyph },
  "tier-6": { kind: "image", src: Tier6Glyph },
};

const PALADIN_CLASS_LEVEL = 6;
const PALADIN_CASTING_ABILITY_SCORE = 14;
// CHA mod + ½ Paladin level (rounded down, min 1)
const PALADIN_PREPARED_LIMIT = Math.max(
  1,
  Math.floor((PALADIN_CASTING_ABILITY_SCORE - 10) / 2) +
    Math.floor(PALADIN_CLASS_LEVEL / 2),
);

const SORCERER_CLASS_LEVEL = 6;
const SORCERER_CASTING_ABILITY_SCORE = 14;

export const SPELLBOOK_TABS = [
  {
    id: "paladin",
    label: "Paladin",
    crest: PaladinCrest,
    classLevel: PALADIN_CLASS_LEVEL,
    castingAbilityScore: PALADIN_CASTING_ABILITY_SCORE,
    subclassLabel: "Oath of Vengeance",
    abilityLabel: "CHA",
    spellSaveDC: 13,
    spellAttackMod: "+5",
    resourceStrip: { kind: "spell-slots", tiers: [1, 2, 3] },
    preparedLimit: PALADIN_PREPARED_LIMIT,
    sections: [
      {
        id: "class-actions",
        glyphKey: "class-action",
        label: "Class Actions",
        rowKey: "class-action",
        showLabel: true,
      },
      {
        id: "at-will",
        glyphKey: "spell-at-will",
        label: "Spells",
        rowKey: "spell-at-will",
        showLabel: true,
      },
      {
        id: "prepared",
        glyphKey: "prepared",
        label: "Prepared",
        framed: true,
        slotsTrailing: true,
        source: "prepared",
      },
      {
        id: "tier-2",
        glyphKey: "tier-2",
        label: "II",
        rowKey: "tier-2",
        slotPipsKey: 2,
      },
      {
        id: "tier-1",
        glyphKey: "tier-1",
        label: "I",
        rowKey: "tier-1",
        slotPipsKey: 1,
      },
    ],
  },
  {
    id: "sorcerer",
    label: "Sorcerer",
    crest: SorcererCrest,
    classLevel: SORCERER_CLASS_LEVEL,
    castingAbilityScore: SORCERER_CASTING_ABILITY_SCORE,
    subclassLabel: "Draconic Bloodline",
    abilityLabel: "CHA",
    spellSaveDC: 13,
    spellAttackMod: "+5",
    resourceStrip: { kind: "spell-slots", tiers: [1, 2, 3] },
    sections: [
      {
        id: "cantrips",
        glyphKey: "cantrip",
        label: "Cantrips",
        rowKey: "cantrip",
        showLabel: true,
      },
      {
        id: "metamagic",
        glyphKey: "metamagic",
        label: "Metamagic",
        source: "metamagic",
        showLabel: true,
      },
      {
        id: "spells",
        glyphKey: "spell-at-will",
        label: "Spells",
        rowKeys: ["tier-1", "tier-2", "tier-3"],
        showLabel: true,
      },
    ],
  },
];

export const getTabById = (id) =>
  SPELLBOOK_TABS.find((tab) => tab.id === id) ?? null;
