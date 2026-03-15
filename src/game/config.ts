export const BOARD_SIZE = 10;

export const SHIPS = [
  { id: "carrier", label: "Carrier", size: 5 },
  { id: "battleship", label: "Battleship", size: 4 },
  { id: "cruiser", label: "Cruiser", size: 3 },
  { id: "submarine", label: "Submarine", size: 3 },
  { id: "destroyer", label: "Destroyer", size: 2 },
] as const;

export type ShipId = (typeof SHIPS)[number]["id"];
