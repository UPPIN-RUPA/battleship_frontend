export type Orientation = "horizontal" | "vertical";
export type Phase = "placement" | "battle" | "game-over";
export type CellStatus = "idle" | "ship" | "hit" | "miss";

export type Coordinate = {
  row: number;
  col: number;
};

export type ShipPlacement<ShipId extends string = string> = {
  shipId: ShipId;
  size: number;
  cells: Coordinate[];
  hits: number;
};

export type BoardCell<ShipId extends string = string> = {
  row: number;
  col: number;
  status: CellStatus;
  shipId: ShipId | null;
};

export type BoardState<ShipId extends string = string> = {
  cells: BoardCell<ShipId>[][];
  ships: ShipPlacement<ShipId>[];
};

export type AttackResult<ShipId extends string = string> = {
  board: BoardState<ShipId>;
  message: string;
  hit: boolean;
  sunkShipId: ShipId | null;
  gameOver: boolean;
};
