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
        text: "Great Weapon Master: All In",
        popupContent: "Deal extra damage at the cost of accuracy.",
    },
    {
        icon: Great_Weapon_Master_Bonus_Attack,
        text: "Great Weapon Master: Bonus Attack",
        popupContent: "Gain an additional attack after a critical hit or reducing a creature to 0 HP.",
    },
    {
        icon: Great_Weapon_Fighting,
        text: "Great Weapon Fighting",
        popupContent: "Reroll 1s and 2s on damage dice with two-handed weapons.",
    },
    {
        icon: Savage_Attacker_Icon,
        text: "Savage Attacker",
        popupContent: "Once per turn, reroll damage for a melee weapon attack.",
    },
    {
        icon: Extra_Attack_Icon,
        text: "Extra Attack",
        popupContent: "Attack twice whenever you take the Attack action.",
    },
    {
        icon: Divine_Health_Icon,
        text: "Divine Health",
        popupContent: "Immune to disease.",
    },
    {
        icon: Divine_Tenets_Icon,
        text: "Oath of Vengeance Tenets",
        popupContent: "Sworn to uphold the tenets of vengeance.",
    },
    {
        icon: Divine_Intervention_Icon,
        text: "Favoured by the Gods",
        popupContent: "Once per short rest, add 2d4 to a failed saving throw or missed attack roll.",
    },
    {
        icon: Darkvision_Icon,
        text: "Darkvision",
        popupContent: "See in dim light within 60 feet as if it were bright light.",
    },
    {
        icon: Draconic_Resistance_Icon,
        text: "Draconic Resilience",
        popupContent: "Gain a +1 bonus to AC and resistance to a damage type.",
    },
    {
        icon: Fey_Ancestry_Icon,
        text: "Fey Ancestry",
        popupContent: "Advantage on saving throws against being charmed, and magic cannot put you to sleep.",
    },
    {
        icon: Curse_Icon,
        text: "Rhea's Divine Punishment",
        popupContent: "Inflict a divine curse on enemies.",
    },
];

//----------------------
//  exports
//----------------------
export default featuresData;
