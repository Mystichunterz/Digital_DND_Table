import PaladinCrest from "../../assets/popups/crests/Class_Paladin_Vengeance_Badge_Icon.png";
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

export const SPELLBOOK_TABS = [
  {
    id: "paladin",
    label: "Paladin",
    crest: PaladinCrest,
    classLevel: 6,
    subclassLabel: "Oath of Vengeance",
    abilityLabel: "CHA",
    spellSaveDC: 13,
    spellAttackMod: "+5",
    resourceStrip: { kind: "spell-slots", tiers: [1, 2, 3] },
    preparedLimit: 11,
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
];

export const getTabById = (id) =>
  SPELLBOOK_TABS.find((tab) => tab.id === id) ?? null;
