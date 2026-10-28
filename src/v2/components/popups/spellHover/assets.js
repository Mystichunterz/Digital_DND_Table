import { ACTIONS } from "../../../data/actionsCatalog";
import ActionIcon from "../../../../assets/resources/action.png";
import BonusActionIcon from "../../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../../assets/resources/reaction.png";
import SpellSlotIconAsset from "../../../../assets/resources/spell_slot.png";
import RitualIconAsset from "../../../../assets/resources/ritual.png";
import ChannelDivinityIconAsset from "../../../../assets/resources/channel_oath.png";
import D8Radiant from "../../../../assets/popups/dice/D8_Radiant.png";
import D8Thunder from "../../../../assets/popups/dice/D8_Thunder.png";
import D8Fire from "../../../../assets/popups/dice/D8_Fire.png";
import D8Psychic from "../../../../assets/popups/dice/D8_Psychic.png";
import D6Thunder from "../../../../assets/popups/dice/D6_Thunder.png";
import D6Fire from "../../../../assets/popups/dice/D6_Fire.png";
import D6Psychic from "../../../../assets/popups/dice/D6_Psychic.png";
import D6Radiant from "../../../../assets/popups/dice/D6_Radiant.png";
import D10Fire from "../../../../assets/popups/dice/D10_Fire.png";
import D10Necrotic from "../../../../assets/popups/dice/D10_Necrotic.png";
import SlashingIcon from "../../../../assets/popups/damage/Slashing_Damage_Icon.png";
import RadiantIcon from "../../../../assets/popups/damage/Radiant_Damage_Icon.png";
import FireIcon from "../../../../assets/popups/damage/Fire_Damage_Icon.png";
import ThunderIcon from "../../../../assets/popups/damage/Thunder_Damage_Icon.png";
import PsychicIcon from "../../../../assets/popups/damage/Psychic_Damage_Icon.png";
import NecroticIcon from "../../../../assets/popups/damage/Necrotic_Damage_Icon.png";
import PiercingIcon from "../../../../assets/popups/damage/Piercing_Damage_Icon.png";
import MeleeIcon from "../../../../assets/popups/mechanics/Melee_Range_Icon.png";
import RangedIcon from "../../../../assets/popups/mechanics/Range_Icon.png";
import AttackRollIcon from "../../../../assets/popups/mechanics/Attack_Roll_Icon.png";
import SavingThrowIcon from "../../../../assets/popups/mechanics/Saving_Throw_Icon.png";
import AoeIcon from "../../../../assets/popups/mechanics/Aoe_Icon.png";
import ConcentrationIcon from "../../../../assets/popups/Duration_Icon.png";

export const ChannelDivinityIcon = ChannelDivinityIconAsset;
export const RitualIcon = RitualIconAsset;
export const SpellSlotIcon = SpellSlotIconAsset;

const POPUP_CHROME_ASSETS = [
  ActionIcon,
  BonusActionIcon,
  ReactionIcon,
  SpellSlotIcon,
  RitualIcon,
  ChannelDivinityIcon,
  D8Radiant,
  D8Thunder,
  D8Fire,
  D8Psychic,
  D6Thunder,
  D6Fire,
  D6Psychic,
  D6Radiant,
  D10Fire,
  D10Necrotic,
  SlashingIcon,
  RadiantIcon,
  FireIcon,
  ThunderIcon,
  PsychicIcon,
  NecroticIcon,
  PiercingIcon,
  MeleeIcon,
  RangedIcon,
  AttackRollIcon,
  SavingThrowIcon,
  AoeIcon,
  ConcentrationIcon,
];

const POPUP_SPELL_ART_ASSETS = Array.from(
  new Set(
    ACTIONS.map((action) => action.popupIcon).filter(
      (url) => typeof url === "string" && url.length > 0,
    ),
  ),
);

if (typeof window !== "undefined" && typeof Image !== "undefined") {
  const preload = () => {
    for (const url of POPUP_CHROME_ASSETS) {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    }
    for (const url of POPUP_SPELL_ART_ASSETS) {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    }
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(preload, { timeout: 1500 });
  } else {
    setTimeout(preload, 0);
  }
}

export const KIND_ICONS = {
  action: ActionIcon,
  bonus: BonusActionIcon,
  reaction: ReactionIcon,
  utility: ActionIcon,
};

export const DAMAGE_TYPE_ICONS = {
  slashing: SlashingIcon,
  radiant: RadiantIcon,
  fire: FireIcon,
  thunder: ThunderIcon,
  psychic: PsychicIcon,
  necrotic: NecroticIcon,
  piercing: PiercingIcon,
};

export const MECHANIC_ICONS = {
  melee: MeleeIcon,
  ranged: RangedIcon,
  "attack-roll": AttackRollIcon,
  save: SavingThrowIcon,
  aoe: AoeIcon,
  range: RangedIcon,
  concentration: ConcentrationIcon,
};

const DICE_ICONS = {
  "d6-thunder": D6Thunder,
  "d6-fire": D6Fire,
  "d6-psychic": D6Psychic,
  "d6-radiant": D6Radiant,
  "d8-radiant": D8Radiant,
  "d8-thunder": D8Thunder,
  "d8-fire": D8Fire,
  "d8-psychic": D8Psychic,
  "d10-fire": D10Fire,
  "d10-necrotic": D10Necrotic,
};

export const pickDiceIcon = (damageRows) => {
  if (!damageRows || damageRows.length === 0) {
    return D8Radiant;
  }

  const lastRow = damageRows[damageRows.length - 1];
  const match = /d(\d+)/.exec(lastRow.formula ?? "");

  if (!match) {
    return D8Radiant;
  }

  const dieSize = match[1];
  const type = lastRow.icon ?? "radiant";

  return DICE_ICONS[`d${dieSize}-${type}`] ?? D8Radiant;
};

export const TIER_LABELS = {
  C: "Cantrip",
  I: "Level 1",
  II: "Level 2",
  III: "Level 3",
  IV: "Level 4",
  V: "Level 5",
};

export const KIND_LABELS = {
  action: "Action",
  bonus: "Bonus Action",
  reaction: "Reaction",
  utility: "Action",
};
