//----------------------
//  src > data > skillsData.js
//----------------------

import Acrobatics_Icon from "../assets/skills/Acrobatics_Icon.png";
import Animal_Handling_Icon from "../assets/skills/Animal_Handling_Icon.png";
import Arcana_Icon from "../assets/skills/Arcana_Icon.png";
import Athletics_Icon from "../assets/skills/Athletics_Icon.png";
import Deception_Icon from "../assets/skills/Deception_Icon.png";
import History_Icon from "../assets/skills/History_Icon.png";
import Insight_Icon from "../assets/skills/Insight_Icon.png";
import Intimidation_Icon from "../assets/skills/Intimidation_Icon.png";
import Investigation_Icon from "../assets/skills/Investigation_Icon.png";
import Medicine_Icon from "../assets/skills/Medicine_Icon.png";
import Nature_Icon from "../assets/skills/Nature_Icon.png";
import Perception_Icon from "../assets/skills/Perception_Icon.png";
import Performance_Icon from "../assets/skills/Performance_Icon.png";
import Persuasion_Icon from "../assets/skills/Persuasion_Icon.png";
import Religion_Icon from "../assets/skills/Religion_Icon.png";
import Sleight_of_Hand_Icon from "../assets/skills/Sleight_of_Hand_Icon.png";
import Stealth_Icon from "../assets/skills/Stealth_Icon.png";
import Survival_Icon from "../assets/skills/Survival_Icon.png";

const skillsData = {
  Athletics: {
    icon: Athletics_Icon,
    ability: "Strength",
    description: "Stay fit. Perform physical stunts.",
    effect: "Helps you shove and resist being shoved.",
  },
  Acrobatics: {
    icon: Acrobatics_Icon,
    ability: "Dexterity",
    description: "Keep your footing through tumbles and tight spots.",
    effect: "Helps you stay upright and resist being knocked **prone**.",
  },
  Stealth: {
    icon: Stealth_Icon,
    ability: "Dexterity",
    description: "Move quietly and stay out of sight.",
    effect: "Helps you sneak past enemies and avoid detection.",
  },
  "Sleight of Hand": {
    icon: Sleight_of_Hand_Icon,
    ability: "Dexterity",
    description: "Pick pockets and palm objects without being noticed.",
    effect: "Helps you **disarm traps** and **pick locks**.",
  },
  Investigation: {
    icon: Investigation_Icon,
    ability: "Intelligence",
    description: "Search for clues and deduce what is hidden.",
    effect: "Helps you find traps, secret doors, and weak points.",
  },
  History: {
    icon: History_Icon,
    ability: "Intelligence",
    description: "Remember legends, kingdoms, and ancient events.",
    effect: "Helps you recall historical context that may aid your party.",
  },
  Arcana: {
    icon: Arcana_Icon,
    ability: "Intelligence",
    description: "Recall knowledge of spells, magical items, and arcane lore.",
    effect: "Helps you identify magic and understand spellwork.",
  },
  Nature: {
    icon: Nature_Icon,
    ability: "Intelligence",
    description: "Recall lore about the wilds, beasts, and weather.",
    effect: "Helps you identify creatures and natural hazards.",
  },
  Religion: {
    icon: Religion_Icon,
    ability: "Intelligence",
    description: "Recall knowledge of deities, rites, and sacred symbols.",
    effect: "Helps you identify divine magic and holy artefacts.",
  },
  "Animal Handling": {
    icon: Animal_Handling_Icon,
    ability: "Wisdom",
    description: "Calm and command beasts.",
    effect: "Helps you ride mounts and handle wild animals.",
  },
  Insight: {
    icon: Insight_Icon,
    ability: "Wisdom",
    description: "Read intent from words and body language.",
    effect: "Helps you spot lies and tell when someone is hiding something.",
  },
  Medicine: {
    icon: Medicine_Icon,
    ability: "Wisdom",
    description: "Treat wounds and stabilise the dying.",
    effect:
      "Helps you diagnose ailments and stop a fallen ally from dying.",
  },
  Perception: {
    icon: Perception_Icon,
    ability: "Wisdom",
    description: "Notice your surroundings with all your senses.",
    effect: "Helps you spot hidden enemies, traps, and details others miss.",
  },
  Survival: {
    icon: Survival_Icon,
    ability: "Wisdom",
    description: "Track creatures and endure the wilds.",
    effect: "Helps you forage, navigate, and follow trails.",
  },
  Performance: {
    icon: Performance_Icon,
    ability: "Charisma",
    description: "Captivate an audience through art and showmanship.",
    effect: "Helps you earn coin, sway crowds, and distract onlookers.",
  },
  Deception: {
    icon: Deception_Icon,
    ability: "Charisma",
    description: "Convince others of things that are not true.",
    effect: "Helps you lie, bluff, and disguise your intentions.",
  },
  Intimidation: {
    icon: Intimidation_Icon,
    ability: "Charisma",
    description: "Lean on others through threats and presence.",
    effect: "Helps you coerce information or back down a hostile foe.",
  },
  Persuasion: {
    icon: Persuasion_Icon,
    ability: "Charisma",
    description: "Win others over with honesty and charm.",
    effect: "Helps you negotiate, plead, and earn trust.",
  },
};

export default skillsData;
