//----------------------
//  src > data > featuresData.js
//----------------------

//----------------------
//  imports
//----------------------
import Great_Weapon_Master_All_In from "../assets/layout/left_display/120px-Great_Weapon_Master_All_In_Icon.webp.png";
import Great_Weapon_Master_Bonus_Attack from "../assets/layout/left_display/120px-Great_Weapon_Master_Icon.webp.png";
import Divine_Health_Icon from "../assets/layout/left_display/120px-Divine_Health_Icon.png";
import Extra_Attack_Icon from "../assets/layout/left_display/120px-Extra_Attack_Icon.webp.png";
import Fey_Ancestry_Icon from "../assets/layout/left_display/120px-Fey_Ancestry_Icon.webp.png";
import Great_Weapon_Fighting from "../assets/layout/left_display/120px-Great_Weapon_Fighting_Icon.webp.png";
import Divine_Tenets_Icon from "../assets/layout/left_display/120px-Divine_Intervention_Arm_Thy_Servant_Icon.webp.png";
import Savage_Attacker_Icon from "../assets/layout/left_display/120px-Savage_Attacker_Icon.webp.png";
import Divine_Intervention_Icon from "../assets/layout/left_display/120px-Divine_Intervention_Sunder_the_Heretical_Icon.webp.png";
import Darkvision_Icon from "../assets/layout/left_display/120px-Darkvision_Icon.webp.png";
import Draconic_Resistance_Icon from "../assets/layout/left_display/120px-Draconic_Resilience_Icon.webp.png";
import Curse_Icon from "../assets/layout/left_display/120px-Bestow_Curse_Debuff_Ability_Icon.webp.png";

//----------------------
//  main
//----------------------
const featuresData = [
    {
        icon: Great_Weapon_Master_All_In,
        title: "Great Weapon Master: All In",
        subtitle: "Toggleable Passive Feature",
        text: "Deal extra damage at the cost of accuracy."
    },
    {
        icon: Great_Weapon_Master_Bonus_Attack,
        title: "Great Weapon Master: Bonus Attack",
        subtitle: "Passive Feature",
        text: "Gain an additional attack after a critical hit or reducing a creature to 0 HP."
    },
    {
        icon: Great_Weapon_Fighting,
        title: "Great Weapon Fighting",
        subtitle: "Passive Feature",
        text: "Reroll 1s and 2s on damage dice with two-handed weapons."
    },
    {
        icon: Savage_Attacker_Icon,
        title: "Savage Attacker",
        subtitle: "Passive Feature",
        text: "Once per turn, reroll damage for a melee weapon attack."
    },
    {
        icon: Extra_Attack_Icon,
        title: "Extra Attack",
        subtitle: "Passive Feature",
        text: "Attack twice whenever you take the Attack action."
    },
    {
        icon: Divine_Health_Icon,
        title: "Divine Health",
        subtitle: "Passive Feature",
        text: "Immune to disease."
    },
    {
        icon: Divine_Tenets_Icon,
        title: "Oath of Vengeance Tenets",
        subtitle: "Passive Feature",
        text: "Sworn to uphold the tenets of vengeance."
    },
    {
        icon: Divine_Intervention_Icon,
        title: "Favoured by the Gods",
        subtitle: "Passive Feature",
        text: "Once per short rest, add 2d4 to a failed saving throw or missed attack roll."
    },
    {
        icon: Darkvision_Icon,
        title: "Darkvision",
        subtitle: "Passive Feature",
        text: "See in dim light within 60 feet as if it were bright light."
    },
    {
        icon: Draconic_Resistance_Icon,
        title: "Draconic Resilience",
        subtitle: "Passive Feature",
        text: "Gain a +1 bonus to AC and resistance to a damage type."
    },
    {
        icon: Fey_Ancestry_Icon,
        title: "Fey Ancestry",
        subtitle: "Passive Feature",
        text: "Advantage on saving throws against being charmed, and magic cannot put you to sleep."
    },
    {
        icon: Curse_Icon,
        title: "Rhea's Divine Punishment",
        subtitle: "Passive Feature",
        text: "Inflict a divine curse on enemies."
    },
];

//----------------------
//  exports
//----------------------
export default featuresData;
