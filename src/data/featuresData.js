//----------------------
//  src > data > featuresData.js
//----------------------

//----------------------
//  imports
//----------------------
import Great_Weapon_Master_All_In from "../assets/popups/features/120px-Great_Weapon_Master_All_In_Icon.webp.png";
import Great_Weapon_Master_Bonus_Attack from "../assets/popups/features/120px-Great_Weapon_Master_Icon.webp.png";
import Divine_Health_Icon from "../assets/popups/features/120px-Divine_Health_Icon.png";
import Extra_Attack_Icon from "../assets/popups/features/120px-Extra_Attack_Icon.webp.png";
import Fey_Ancestry_Icon from "../assets/popups/features/120px-Fey_Ancestry_Icon.webp.png";
import Great_Weapon_Fighting from "../assets/popups/features/120px-Great_Weapon_Fighting_Icon.webp.png";
import Divine_Tenets_Icon from "../assets/popups/features/120px-Divine_Intervention_Arm_Thy_Servant_Icon.webp.png";
import Savage_Attacker_Icon from "../assets/popups/features/120px-Savage_Attacker_Icon.webp.png";
import Divine_Intervention_Icon from "../assets/popups/features/120px-Divine_Intervention_Sunder_the_Heretical_Icon.webp.png";
import Darkvision_Icon from "../assets/popups/features/120px-Darkvision_Icon.webp.png";
import Draconic_Resistance_Icon from "../assets/popups/features/120px-Draconic_Resilience_Icon.webp.png";
import Curse_Icon from "../assets/popups/features/120px-Bestow_Curse_Debuff_Ability_Icon.webp.png";

//----------------------
//  main
//----------------------
const featuresData = [
    {
        icon: Great_Weapon_Master_All_In,
        title: "Great Weapon Master: All In",
        subtitle: "Toggleable Passive Feature",
        text: "When attacking with a melee weapon you are **Proficient** with and are wielding in both hands, **Attack Rolls** take a -5 penalty, but their damage increases by 10."
    },
    {
        icon: Great_Weapon_Master_Bonus_Attack,
        title: "Great Weapon Master: Bonus Attack",
        subtitle: "Passive Feature",
        text: "When you land a **Critical Hit** or kill a target with a **melee weapon attack**, you can make another melee weapon attack as a **bonus action** that turn."
    },
    {
        icon: Great_Weapon_Fighting,
        title: "Great Weapon Fighting",
        subtitle: "Passive Feature",
        text: "When you roll a 1 or 2 on a damage die for an attack with a two-handed **melee weapon**, that die is rerolled once."
    },
    {
        icon: Savage_Attacker_Icon,
        title: "Savage Attacker",
        subtitle: "Passive Feature",
        text: "Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target."
    },
    {
        icon: Extra_Attack_Icon,
        title: "Extra Attack",
        subtitle: "Passive Feature",
        text: "You can attack twice instead of once whenever you take the Attack action on your turn."
    },
    {
        icon: Divine_Health_Icon,
        title: "Divine Health",
        subtitle: "Passive Feature",
        text: "The divine magic flowing through you prevents disease from affecting you."
    },
    {
        icon: Divine_Tenets_Icon,
        title: "Oath of Vengeance Tenets",
        subtitle: "Passive Feature",
        text: "Oath of Vengeance paladins abide by the following tenets: \n\nFight the Greater Evil. Exerting your wisdom, identify the higher morality in any given instance, and fight for it. \n\nNo Mercy for the Wicked. Chasten those who dole out their villainy by wiping their blight from the world forever. \n\nFailure to abide by their tenets will result in a paladin forsaking their Oath, and becoming something very different."
    },
    {
        icon: Divine_Intervention_Icon,
        title: "Favoured by the Gods",
        subtitle: "Passive Feature",
        text: "Starting at 1st level, divine power guards your destiny. \n\nIf you fail a **saving throw** or miss with an **attack roll**, you can roll 2d4 and add it to the total, possibly changing the outcome. \n\nRecharges on short or long rest."
    },
    {
        icon: Darkvision_Icon,
        title: "Darkvision",
        subtitle: "Passive Feature",
        text: "Thanks to your elven blood, you have superior vision in dark and dim conditions. \n\nYou can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. \n\nYou can't discern color in darkness, only shades of gray."
    },
    {
        icon: Draconic_Resistance_Icon,
        title: "Draconic Resilience",
        subtitle: "Passive Feature",
        text: "Your skin hardens to the touch. You have **Resistance** to non-magical **Slashing** and **Piercing** damage."
    },
    {
        icon: Fey_Ancestry_Icon,
        title: "Fey Ancestry",
        subtitle: "Passive Feature",
        text: "You have **advantage** on **saving throws** against being Charmed, and magic cannot put you to sleep."
    },
    {
        icon: Curse_Icon,
        title: "Rhea's Divine Punishment",
        subtitle: "Passive Feature",
        text: "Suffer a -2 penalty to your **Charisma** score, and one less **Level 1 Spell Slot** per Long Rest. \n\nYour abandonment of Rhea leaves a lingering void. An aura of divine loss surrounds you, unsettling those who sense the fracture in your spirit."
    },
];

//----------------------
//  exports
//----------------------
export default featuresData;
