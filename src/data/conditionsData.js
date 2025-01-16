//----------------------
//  src > data > conditionsData.js
//----------------------

//----------------------
//  imports
//----------------------
import Aura_of_Protection_Icon from "../assets/popups/conditions/120px-Aura_of_Protection_Icon.webp.png";
import Bless_Icon from "../assets/popups/conditions/Spell_Enchantment_Bless.png";
import Blade_Ward_Icon from "../assets/popups/conditions/380px-Blade_Ward.webp.png";

//----------------------
//  main
//----------------------
const conditionsData = [
    {
        icon: Aura_of_Protection_Icon,
        title: "Aura of Protection",
        subtitle: "Condition",
        duration: "Permanent",
        text: "The paladin and any nearby allies within 10 feet of them gain a +2 bonus to all **saving throws**."
    },
    {
        icon: Bless_Icon,
        title: "Bless",
        subtitle: "Condition",
        duration: "10 turns remaining",
        text: "Gain a +1d4 bonus to **Attack Rolls** and **Saving Throws**."
    },
    {
        icon: Blade_Ward_Icon,
        title: "Blade Ward",
        subtitle: "Condition",
        text: "Has **Resistance** against bludgeoning, piercing, and slashing damage."
    }
];

//----------------------
//  exports
//----------------------
export default conditionsData;
