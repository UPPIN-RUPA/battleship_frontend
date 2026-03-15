import { BOARD_SIZE, SHIPS, ShipId } from "./config";
import { AttackResult, BoardState, CellStatus, Coordinate, Orientation } from "./types";

export function createEmptyBoard(): BoardState<ShipId> {
  return {
    cells: Array.from({ length: BOARD_SIZE }, (_, row) =>
      Array.from({ length: BOARD_SIZE }, (_, col) => ({
        row,
        col,
        status: "idle" as CellStatus,
        shipId: null,
      })),
    ),
    ships: [],
  };
}

export function cloneBoard(board: BoardState<ShipId>): BoardState<ShipId> {
  return {
    cells: board.cells.map((row) => row.map((cell) => ({ ...cell }))),
    ships: board.ships.map((ship) => ({
      ...ship,
      cells: ship.cells.map((coord) => ({ ...coord })),
    })),
  };
}

export function createRandomBoard() {
  let board = createEmptyBoard();
  SHIPS.forEach((ship) => {
    let placed = false;
    while (!placed) {
      const orientation: Orientation = Math.random() > 0.5 ? "horizontal" : "vertical";
      const row = randomInt(0, BOARD_SIZE - 1);
      const col = randomInt(0, BOARD_SIZE - 1);
      const cells = buildShipCells(row, col, ship.size, orientation);
      if (cells && canPlaceShip(board, cells)) {
        board = addShipToBoard(board, ship.id, ship.size, cells);
        placed = true;
      }
    }
  });
  return board;
}

export function buildShipCells(row: number, col: number, size: number, orientation: Orientation): Coordinate[] | null {
  const cells = Array.from({ length: size }, (_, index) => ({
    row: orientation === "horizontal" ? row : row + index,
    col: orientation === "horizontal" ? col + index : col,
  }));

  const withinBounds = cells.every(
    (coord) => coord.row >= 0 && coord.row < BOARD_SIZE && coord.col >= 0 && coord.col < BOARD_SIZE,
  );

  return withinBounds ? cells : null;
}

export function canPlaceShip(board: BoardState<ShipId>, cells: Coordinate[]) {
  return cells.every((coord) => {
    if (board.cells[coord.row][coord.col].shipId) return false;

    for (let deltaRow = -1; deltaRow <= 1; deltaRow += 1) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol += 1) {
        const nextRow = coord.row + deltaRow;
        const nextCol = coord.col + deltaCol;
        if (nextRow < 0 || nextRow >= BOARD_SIZE || nextCol < 0 || nextCol >= BOARD_SIZE) continue;
        if (board.cells[nextRow][nextCol].shipId) return false;
      }
    }
    return true;
  });
}

export function addShipToBoard(board: BoardState<ShipId>, shipId: ShipId, size: number, cells: Coordinate[]) {
  const nextBoard = cloneBoard(board);
  cells.forEach((coord) => {
    nextBoard.cells[coord.row][coord.col].status = "ship";
    nextBoard.cells[coord.row][coord.col].shipId = shipId;
  });
  nextBoard.ships.push({ shipId, size, cells, hits: 0 });
  return nextBoard;
}

export function applyAttack(board: BoardState<ShipId>, row: number, col: number): AttackResult<ShipId> {
  const nextBoard = cloneBoard(board);
  const targetCell = nextBoard.cells[row][col];

  if (targetCell.status === "hit" || targetCell.status === "miss") {
    return {
      board: nextBoard,
      message: "That coordinate was already targeted.",
      hit: false,
      sunkShipId: null,
      gameOver: false,
    };
  }

  if (targetCell.shipId) {
    targetCell.status = "hit";
    const ship = nextBoard.ships.find((entry) => entry.shipId === targetCell.shipId)!;
    ship.hits += 1;
    const sunk = ship.hits >= ship.size;
    const gameOver = nextBoard.ships.every((entry) => entry.hits >= entry.size);
    return {
      board: nextBoard,
      message: sunk ? `Direct hit. ${shipLabel(ship.shipId)} sunk.` : "Direct hit on the enemy hull.",
      hit: true,
      sunkShipId: sunk ? ship.shipId : null,
      gameOver,
    };
  }

  targetCell.status = "miss";
  return {
    board: nextBoard,
    message: "Shot splashed wide.",
    hit: false,
    sunkShipId: null,
    gameOver: false,
  };
}

export function neighboringCoordinates(coord: Coordinate) {
  return [
    { row: coord.row - 1, col: coord.col },
    { row: coord.row + 1, col: coord.col },
    { row: coord.row, col: coord.col - 1 },
    { row: coord.row, col: coord.col + 1 },
  ].filter(
    (candidate) =>
      candidate.row >= 0 &&
      candidate.row < BOARD_SIZE &&
      candidate.col >= 0 &&
      candidate.col < BOARD_SIZE,
  );
}

export function dedupeCoordinates(coords: Coordinate[]) {
  const seen = new Set<string>();
  return coords.filter((coord) => {
    const key = serializeCoordinate(coord);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isShipSunk(board: BoardState<ShipId>, shipId: ShipId) {
  const ship = board.ships.find((entry) => entry.shipId === shipId);
  return ship ? ship.hits >= ship.size : false;
}

export function remainingShips(board: BoardState<ShipId>) {
  return board.ships.filter((ship) => ship.hits < ship.size).length;
}

export function countCells(board: BoardState<ShipId>, status: CellStatus) {
  return board.cells.flat().filter((cell) => cell.status === status).length;
}

export function shipLabel(shipId: ShipId) {
  return SHIPS.find((ship) => ship.id === shipId)?.label ?? shipId;
}

export function labelForPhase(phase: "placement" | "battle" | "game-over") {
  if (phase === "placement") return "Deployment";
  if (phase === "battle") return "Battle";
  return "Finished";
}

export function coordinateLabel(coord: Coordinate) {
  return `${String.fromCharCode(65 + coord.col)}${coord.row + 1}`;
}

export function serializeCoordinate(coord: Coordinate) {
  return `${coord.row}:${coord.col}`;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function allEqual(values: number[]) {
  return values.every((value) => value === values[0]);
}

export function prioritizedTargets(board: BoardState<ShipId>, previousShots: Set<string>) {
  const liveHits = board.cells
    .flat()
    .filter((cell) => cell.status === "hit" && cell.shipId && !isShipSunk(board, cell.shipId))
    .map((cell) => ({ row: cell.row, col: cell.col }));

  if (liveHits.length === 0) return [];

  const rowAligned = allEqual(liveHits.map((cell) => cell.row));
  const colAligned = allEqual(liveHits.map((cell) => cell.col));

  let candidates: Coordinate[] = [];

  if (liveHits.length > 1 && rowAligned) {
    const row = liveHits[0].row;
    const cols = liveHits.map((cell) => cell.col).sort((a, b) => a - b);
    candidates = [
      { row, col: cols[0] - 1 },
      { row, col: cols[cols.length - 1] + 1 },
    ];
  } else if (liveHits.length > 1 && colAligned) {
    const col = liveHits[0].col;
    const rows = liveHits.map((cell) => cell.row).sort((a, b) => a - b);
    candidates = [
      { row: rows[0] - 1, col },
      { row: rows[rows.length - 1] + 1, col },
    ];
  } else {
    candidates = liveHits.flatMap((hit) => neighboringCoordinates(hit));
  }

  return dedupeCoordinates(
    candidates.filter(
      (coord) =>
        coord.row >= 0 &&
        coord.row < BOARD_SIZE &&
        coord.col >= 0 &&
        coord.col < BOARD_SIZE &&
        !previousShots.has(serializeCoordinate(coord)),
    ),
  );
}
