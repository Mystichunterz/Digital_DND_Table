import TwinnedSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Twinned_Spell_Icon.webp";
import DistantSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Distant_Spell_Icon.webp";
import QuickenedSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Quickened_Spell_Icon.webp";
import SubtleSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Subtle_Spell_Icon.webp";
import HeightenedSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Heightened_Spell_Icon.webp";
import ExtendedSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Extended_Spell_Icon.webp";
import EmpoweredSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Empowered_Spell_Icon.webp";
import CarefulSpellIcon from "../../../../../assets/actions/metamagic/Metamagic_Careful_Spell_Icon.webp";
import SeekingSpellIcon from "../../../../../assets/actions/metamagic/Seeking_Spell_Icon.webp";

export const METAMAGIC_SLOT_COUNT = 10;

export const METAMAGIC_OPTIONS = [
  {
    id: "twinned-spell",
    name: "Twinned Spell",
    icon: TwinnedSpellIcon,
    description:
      "Spells that only target 1 creature can target an additional creature.\n\nFor spells that don't shoot a projectile, the targets need to be close enough together.",
    cost: "Costs 1 Sorcery Point per spell slot level used. Cantrips also cost 1 Sorcery Point.",
  },
  {
    id: "distant-spell",
    name: "Distant Spell",
    icon: DistantSpellIcon,
    description:
      "Extends the range of a spell by 50%. Melee spells have their range increased to 9 m / 30 ft.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "quickened-spell",
    name: "Quickened Spell",
    icon: QuickenedSpellIcon,
    description:
      "Spells that take an Action to cast take a Bonus Action instead.",
    cost: "Costs 3 Sorcery Points.",
  },
  {
    id: "subtle-spell",
    name: "Subtle Spell",
    icon: SubtleSpellIcon,
    description: "You can cast spells while Silenced.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "heightened-spell",
    name: "Heightened Spell",
    icon: HeightenedSpellIcon,
    description:
      "Targets of spells that require Saving Throws have Disadvantage on their first Saving Throw against the spell.",
    cost: "Costs 3 Sorcery Points.",
  },
  {
    id: "extended-spell",
    name: "Extended Spell",
    icon: ExtendedSpellIcon,
    description:
      "Doubles the duration of Conditions, summons, and surfaces caused by spells, up to a maximum of 24 turns.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "empowered-spell",
    name: "Empowered Spell",
    icon: EmpoweredSpellIcon,
    description:
      "Reroll a number of damage dice up to your Charisma modifier when you cast a spell. You must use the new rolls.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "careful-spell",
    name: "Careful Spell",
    icon: CarefulSpellIcon,
    description:
      "Allies automatically succeed Saving Throws against spells that require them.",
    cost: "Costs 1 Sorcery Point.",
  },
  {
    id: "seeking-spell",
    name: "Seeking Spell",
    icon: SeekingSpellIcon,
    description:
      "If a Spell Attack misses, you can reroll the Attack Roll once. You must use the new roll.",
    cost: "Costs 2 Sorcery Points.",
  },
];
