import ActionIcon from "../../../../../assets/resources/action.png";
import BonusActionIcon from "../../../../../assets/resources/bonus_action.png";
import ReactionIcon from "../../../../../assets/resources/reaction.png";
import ChannelOathIcon from "../../../../../assets/resources/channel_oath.png";
import FavouredByGodsIcon from "../../../../../assets/popups/features/120px-Divine_Intervention_Sunder_the_Heretical_Icon.webp.png";
import SerasBenevolenceIcon from "../../../../../assets/popups/spells/Bless_Icon.webp";
import DivineSenseIcon from "../../../../../assets/resources/divine_sense.webp";
import LayOnHandsIcon from "../../../../../assets/resources/lay_on_hands.png";
import SorceryPointsIcon from "../../../../../assets/resources/sorcery_points.png";

export const TIER_LABELS = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI" };
export const TIER_KEYS = [1, 2, 3, 4, 5, 6];

export const SINGLE_RESOURCES = [
  { key: "action", iconSrc: ActionIcon, kind: "action", label: "Action" },
  {
    key: "bonus",
    iconSrc: BonusActionIcon,
    kind: "bonus",
    label: "Bonus action",
  },
  { key: "reaction", iconSrc: ReactionIcon, kind: "reaction", label: "Reaction" },
  {
    key: "channelOath",
    iconSrc: ChannelOathIcon,
    kind: "channel-oath",
    label: "Channel Oath",
  },
  {
    key: "favouredByGods",
    iconSrc: FavouredByGodsIcon,
    kind: "favoured-by-gods",
    label: "Favoured by the Gods",
  },
];

export const COUNTED_RESOURCES = [
  {
    key: "layOnHands",
    iconSrc: LayOnHandsIcon,
    kind: "lay-on-hands",
    label: "Lay on Hands",
  },
  {
    key: "sorceryPoints",
    iconSrc: SorceryPointsIcon,
    kind: "sorcery-points",
    label: "Sorcery Points",
  },
  {
    key: "divineSense",
    iconSrc: DivineSenseIcon,
    kind: "divine-sense",
    label: "Divine Sense",
  },
  {
    key: "seraSneakAttack",
    iconSrc: SerasBenevolenceIcon,
    kind: "sera-sneak-attack",
    label: "Sera's Blessing (Sneak Attack)",
  },
];
