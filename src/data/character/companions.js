const companionsData = [
  {
    id: "bearn",
    name: "Béarn",
    role: "Mount",
    classLevel: "Lv 5 Warhorse",
    race: "Fey Warhorse",
    alignment: "Neutral",
    xp: 0,
    ac: 18,
    hp: { current: 25, max: 25 },
    tempHp: 0,
    speed: 60,
    initiative: "+1",
    hitDice: "2d10",
    abilities: {
      STR: { score: 18, mod: "+4" },
      DEX: { score: 12, mod: "+1" },
      CON: { score: 14, mod: "+2" },
      INT: { score: 6, mod: "-2" },
      WIS: { score: 12, mod: "+1" },
      CHA: { score: 8, mod: "-1" },
    },
    attacks: [
      {
        name: "Otherworldly Slam",
        bonus: "+3",
        damage: "1d8 + 2",
        type: "Psychic",
        notes:
          "Melee Attack Roll: bonus equals Sariel's spell-attack modifier, reach 5 ft. Hit: 1d8 + 2 psychic (Celestial) damage.",
      },
    ],
    traits: [
      {
        name: "Telepathy (1 Mile)",
        text: "Mental link with the caster only, out to one mile.",
      },
      {
        name: "Draconic Dictionary",
        text: "Understands and speaks Draconic alongside the rider's tongues.",
      },
      {
        name: "Life Bond",
        text: "When the rider regains hit points from a level 1+ spell, the steed regains the same number of hit points if within 5 feet.",
      },
      {
        name: "Fey Step",
        text: "Recharges after a Long Rest. The steed teleports — together with its rider — to an unoccupied space of your choice up to 60 feet away.",
      },
      {
        name: "Fell Glare",
        text: "Recharges after a Long Rest. One creature within 60 feet that the steed can see makes a Wisdom save (DC equals Sariel's spell save DC). On a failure, the target is Frightened until the end of your next turn.",
      },
      {
        name: "Healing Touch",
        text: "Recharges after a Long Rest. One creature within 5 feet of the steed regains hit points equal to 2d8 + the spell's level.",
      },
      {
        name: "Flight",
        text: "Becomes available once a level 4+ spell slot is used to summon the steed.",
      },
    ],
  },
  {
    id: "jormir",
    name: "Jormir",
    role: "Empty Slot",
    isEmpty: true,
    note: "Reserved for a second companion or familiar.",
  },
];

export default companionsData;
