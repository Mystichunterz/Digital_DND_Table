const personaData = {
  playerName: "Mystic",
  alignment: "Neutral Good",
  xp: 10000,
  age: "Early 20s",
  height: "6'1\"",
  weight: "75 kg",
  eyes: "Blue-Grey",
  skin: "Fair",
  hair: "Light-Blue Ponytail",
  distinguishingMark:
    "A burn scar stretching from the bottom-left to the top-right of her face.",
  faith: "Vulcan, God of Fire",
};

const personalityData = [
  {
    key: "traits",
    label: "Personality Traits",
    items: ["Loyal", "Brave", "True"],
  },
  {
    key: "ideals",
    label: "Ideals",
    items: ["Justice", "Honour", "Vengeance"],
    note: "Chosen of Vulcan, God of Fire",
  },
  {
    key: "bonds",
    label: "Bonds",
    items: [
      "Sworn vengeance against the Cult of Krade.",
      "Carries the memory of the Frost heiress she failed to save.",
    ],
  },
  {
    key: "flaws",
    label: "Flaws",
    items: [
      "Haunted by Guilt",
      "Stubborn",
      "Reckless",
      "Blinded by Vengeance",
    ],
  },
];

const backstoryParagraphs = [
  "Sariel Hewlett was born to a human father and an elven mother in a small village on the outskirts of Luminara Forest. Her father was a respected soldier in the Emperor's guard, and her mother was a wood elf healer who taught Sariel the ways of the forest.",
  "Initially a devout follower of Rhea, she joined the service of House Frost, a minor noble family sworn to the Emperor. Her exceptional combat skills quickly elevated her through the ranks, leading to her assignment as the sworn protector of the young heiress of House Frost.",
  "One fateful night, assassins from a cult devoted to Krade, the God of Dragons and destruction, infiltrated the Frost estate. Despite her efforts, Sariel was overpowered. The assassins used dragonfire, leaving her with a burn scar stretching across her face. Tragically, the heiress she was sworn to protect was slain.",
  "Haunted by her failure, Sariel swore an Oath of Vengeance. She has since forsaken Rhea, and has turned to Vulcan, the God of Fire. She now wanders Veraltia, seeking to dismantle the cult of Krade.",
];

const languagesData = ["Common", "Elvish", "Draconic"];

const coinsData = [
  { code: "CP", label: "Copper", value: 0 },
  { code: "SP", label: "Silver", value: 0 },
  { code: "EP", label: "Electrum", value: 0 },
  { code: "GP", label: "Gold", value: 860 },
  { code: "PP", label: "Platinum", value: 0 },
];

const attunementSlots = [
  { id: 1, item: null },
  { id: 2, item: null },
  { id: 3, item: null },
];

export {
  personaData,
  personalityData,
  backstoryParagraphs,
  languagesData,
  coinsData,
  attunementSlots,
};
