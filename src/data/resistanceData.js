import Slashing_Resistance_NM from "../assets/layout/left_display/79px-Slashing_Resistance_NM.png";
import Piercing_Resistance_NM from "../assets/layout/left_display/79px-Piercing_Resistance_NM.png";

const resistanceData = [
  {
    id: "slashing",
    label: "Slashing",
    title: "Slashing Resistance",
    icon: Slashing_Resistance_NM,
    rules: [
      {
        kind: "non-magical",
        text: "Slashing damage against you from non-magical attacks is halved.",
      },
    ],
  },
  {
    id: "piercing",
    label: "Piercing",
    title: "Piercing Resistance",
    icon: Piercing_Resistance_NM,
    rules: [
      {
        kind: "non-magical",
        text: "Piercing damage against you from non-magical attacks is halved.",
      },
    ],
  },
];

export default resistanceData;
