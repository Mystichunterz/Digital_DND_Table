//----------------------
//  src > data > abilityScoresData.js
//----------------------

import Strength_Icon from "../assets/popups/attributes/Strength_Icon.png";
import Dexterity_Icon from "../assets/popups/attributes/Dexterity_Icon.png";
import Constitution_Icon from "../assets/popups/attributes/Constitution_Icon.png";
import Intelligence_Icon from "../assets/popups/attributes/Intelligence_Icon.png";
import Wisdom_Icon from "../assets/popups/attributes/Wisdom_Icon.png";
import Charisma_Icon from "../assets/popups/attributes/Charisma_Icon.png";

//----------------------
//  main
//----------------------
const abilityScoresData = [
    { icon: Strength_Icon, label: "STR", title: "Strength", value: 16, isPrimary: true, isProficient: false, description: "Muscles and physical power. Affects your effictiveness with melee weapons. Also determines how far you can jump and how much you can carry.", savingThrows: ["Strength, +3"], sources: ["**16** Base"] },
    { icon: Dexterity_Icon, label: "DEX", title: "Dexterity", value: 12, isPrimary: false, isProficient: false, description: "Agility, reflexes, and balance. Affects your effectiveness with ranged and **Finesse** weapons. Also affects your initiative and **Armour Class**.", savingThrows: ["Dexterity, +1"], sources: ["**12** Base"] },
    { icon: Constitution_Icon, label: "CON", title: "Constitution", value: 14, isPrimary: false, isProficient: false, description: "Stamina and physical endurance. Affects your **hit point** maximum.", savingThrows: ["Constitution, +2"], sources: ["**14** Base"] },
    { icon: Intelligence_Icon, label: "INT", title: "Intelligence", value: 8, isPrimary: false, isProficient: false, description: "Memory and mental power. Improves spellcasting for wizards.", savingThrows: ["Intelligence, -1"], sources: ["**8** Base"] },
    { icon: Wisdom_Icon, label: "WIS", title: "Wisdom", value: 10, isPrimary: false, isProficient: true, description: "Senses and intuition. Improves spellcasting for clerics, druids, and rangers.", savingThrows: ["Wisdom, +0"], sources: ["**10** Base"] },
    { icon: Charisma_Icon, label: "CHA", title: "Charisma", value: 14, isPrimary: false, isProficient: true, description: "Force of personality. Improves spellcasting for bards, paladins, sorcerers and warlocks. Influences tranders' prices.", savingThrows: ["Charisma, +2"], sources: ["**16** Base", "**-2** from Rhea's Divine Punishment"] },
];
//----------------------
//  exports
//----------------------
export default abilityScoresData;
