import { useMemo, useState } from "react";
import { Board } from "./components/Board";
import { Dashboard } from "./components/Dashboard";
import { SHIPS, ShipId } from "./game/config";
import {
  addShipToBoard,
  applyAttack,
  buildShipCells,
  canPlaceShip,
  coordinateLabel,
  countCells,
  createEmptyBoard,
  createRandomBoard,
  dedupeCoordinates,
  neighboringCoordinates,
  prioritizedTargets,
  remainingShips,
  serializeCoordinate,
} from "./game/helpers";
import { BoardState, Coordinate, Orientation, Phase } from "./game/types";

type GameState = {
  phase: Phase;
  playerBoard: BoardState<ShipId>;
  computerBoard: BoardState<ShipId>;
  placementIndex: number;
  orientation: Orientation;
  currentTurn: "player" | "computer";
  message: string;
  winner: "player" | "computer" | null;
  computerTargets: Coordinate[];
  previousComputerShots: Set<string>;
  hoveredCell: Coordinate | null;
};

export function App() {
  const [game, setGame] = useState<GameState>(() => createNewGame());

  const activeShip = SHIPS[game.placementIndex] ?? null;
  const playerShipsPlaced = game.playerBoard.ships.length;
  const computerShipsRemaining = remainingShips(game.computerBoard);
  const playerShipsRemaining = remainingShips(game.playerBoard);

  const playerStats = useMemo(
    () => ({
      hits: countCells(game.playerBoard, "hit"),
      misses: countCells(game.playerBoard, "miss"),
    }),
    [game.playerBoard],
  );

  const opponentStats = useMemo(
    () => ({
      hits: countCells(game.computerBoard, "hit"),
      misses: countCells(game.computerBoard, "miss"),
    }),
    [game.computerBoard],
  );

  function placeShip(row: number, col: number) {
    if (game.phase !== "placement" || !activeShip) return;

    const previewCells = buildShipCells(row, col, activeShip.size, game.orientation);
    if (!previewCells || !canPlaceShip(game.playerBoard, previewCells)) {
      setGame((prev) => ({ ...prev, message: `Cannot place ${activeShip.label} there.` }));
      return;
    }

    const nextBoard = addShipToBoard(game.playerBoard, activeShip.id, activeShip.size, previewCells);
    const nextPlacementIndex = game.placementIndex + 1;
    const placementDone = nextPlacementIndex >= SHIPS.length;

    setGame((prev) => ({
      ...prev,
      playerBoard: nextBoard,
      placementIndex: nextPlacementIndex,
      phase: placementDone ? "battle" : "placement",
      currentTurn: placementDone ? "player" : prev.currentTurn,
      message: placementDone
        ? "All ships placed. Fire on the enemy board to begin."
        : `Placed ${activeShip.label}. Position your ${SHIPS[nextPlacementIndex].label}.`,
    }));
  }

  function randomizePlayerBoard() {
    setGame((prev) => ({
      ...prev,
      playerBoard: createRandomBoard(),
      placementIndex: SHIPS.length,
      phase: "battle",
      currentTurn: "player",
      message: "Fleet randomized. Battle stations ready.",
    }));
  }

  function resetPlacements() {
    setGame((prev) => ({
      ...prev,
      playerBoard: createEmptyBoard(),
      placementIndex: 0,
      phase: "placement",
      currentTurn: "player",
      message: "Board cleared. Place your Carrier to begin.",
    }));
  }

  function rotateShip() {
    if (game.phase !== "placement") return;
    setGame((prev) => ({
      ...prev,
      orientation: prev.orientation === "horizontal" ? "vertical" : "horizontal",
    }));
  }

  function attackComputer(row: number, col: number) {
    if (game.phase !== "battle" || game.currentTurn !== "player") return;
    const cell = game.computerBoard.cells[row][col];
    if (cell.status === "hit" || cell.status === "miss") return;

    const result = applyAttack(game.computerBoard, row, col);
    if (result.gameOver) {
      setGame((prev) => ({
        ...prev,
        computerBoard: result.board,
        phase: "game-over",
        winner: "player",
        message: `${result.message} You win the battle.`,
      }));
      return;
    }

    setGame((prev) => ({
      ...prev,
      computerBoard: result.board,
      currentTurn: "computer",
      message: `${result.message} Enemy turn...`,
    }));

    window.setTimeout(() => {
      setGame((current) => runComputerTurn(current));
    }, 550);
  }

  function newGame() {
    setGame(createNewGame());
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Battleship Frontend</div>
        <h1>Command your fleet and sink the enemy before they find you.</h1>
        <p className="copy">
          Place your ships, rotate or randomize the fleet, then take turns attacking the enemy grid. Hits, misses,
          sunk ships, and the final outcome are all handled in the browser.
        </p>
      </section>

      <Dashboard
        phase={game.phase}
        message={game.message}
        orientation={game.orientation}
        placementIndex={game.placementIndex}
        placedShipIds={game.playerBoard.ships.map((ship) => ship.shipId)}
        playerShipsPlaced={playerShipsPlaced}
        playerShipsRemaining={playerShipsRemaining}
        computerShipsRemaining={computerShipsRemaining}
        currentTurn={game.currentTurn}
        onNewGame={newGame}
        onRotateShip={rotateShip}
        onRandomize={randomizePlayerBoard}
        onResetPlacements={resetPlacements}
      />

      <section className="boards-layout">
        <article className="panel board-panel">
          <div className="panel-heading">
            <div>
              <h2>Your Fleet</h2>
              <p className="panel-copy">
                {game.phase === "placement" && activeShip
                  ? `Place your ${activeShip.label} (${activeShip.size} cells).`
                  : "Track your own ship health and incoming enemy fire."}
              </p>
            </div>
            <div className="board-stats">
              <span>Hits taken {playerStats.hits}</span>
              <span>Misses taken {playerStats.misses}</span>
            </div>
          </div>
          <Board
            board={game.playerBoard}
            revealShips
            interactive={game.phase === "placement"}
            onCellClick={placeShip}
            preview={game.phase === "placement" && activeShip ? buildShipCellsPreview(game, activeShip.size) : null}
            onCellHover={(row, col) => setGame((prev) => ({ ...prev, hoveredCell: { row, col } }))}
            onBoardLeave={() => setGame((prev) => ({ ...prev, hoveredCell: null }))}
          />
        </article>

        <article className="panel board-panel">
          <div className="panel-heading">
            <div>
              <h2>Enemy Waters</h2>
              <p className="panel-copy">
                {game.phase === "battle"
                  ? "Select a square to fire. Hits keep pressure on the enemy fleet."
                  : "Enemy ships stay hidden until battle begins."}
              </p>
            </div>
            <div className="board-stats">
              <span>Enemy hits {opponentStats.hits}</span>
              <span>Enemy misses {opponentStats.misses}</span>
            </div>
          </div>
          <Board
            board={game.computerBoard}
            revealShips={game.phase === "game-over"}
            interactive={game.phase === "battle" && game.currentTurn === "player"}
            onCellClick={attackComputer}
            preview={null}
            onCellHover={() => {}}
            onBoardLeave={() => {}}
          />
        </article>
      </section>
    </main>
  );
}

function createNewGame(): GameState {
  return {
    phase: "placement",
    playerBoard: createEmptyBoard(),
    computerBoard: createRandomBoard(),
    placementIndex: 0,
    orientation: "horizontal",
    currentTurn: "player",
    message: "Place your Carrier to begin the battle plan.",
    winner: null,
    computerTargets: [],
    previousComputerShots: new Set<string>(),
    hoveredCell: null,
  };
}

function runComputerTurn(game: GameState): GameState {
  if (game.phase !== "battle" || game.currentTurn !== "computer") return game;

  const shot = chooseComputerShot(game);
  if (!shot) {
    return {
      ...game,
      phase: "game-over",
      winner: "player",
      message: "Enemy has no legal shots remaining. You win.",
    };
  }

  const result = applyAttack(game.playerBoard, shot.row, shot.col);
  const nextPreviousShots = new Set(game.previousComputerShots);
  nextPreviousShots.add(serializeCoordinate(shot));

  let nextTargets = game.computerTargets.filter(
    (coord) => coord.row !== shot.row || coord.col !== shot.col,
  );

  if (result.hit && result.sunkShipId) {
    nextTargets = [];
  } else if (result.hit) {
    const neighboringTargets = prioritizedTargets(result.board, nextPreviousShots).filter((coord) => {
      const key = serializeCoordinate(coord);
      return !nextPreviousShots.has(key);
    });
    nextTargets = dedupeCoordinates([...neighboringTargets, ...nextTargets]);
  }

  if (result.gameOver) {
    return {
      ...game,
      playerBoard: result.board,
      phase: "game-over",
      winner: "computer",
      computerTargets: nextTargets,
      previousComputerShots: nextPreviousShots,
      message: `${coordinateLabel(shot)}: ${result.message} Your fleet has been destroyed.`,
    };
  }

  return {
    ...game,
    playerBoard: result.board,
    currentTurn: "player",
    computerTargets: nextTargets,
    previousComputerShots: nextPreviousShots,
    message: `${coordinateLabel(shot)}: ${result.message} Your turn to fire.`,
  };
}

function chooseComputerShot(game: GameState): Coordinate | null {
  const availableTargets = game.computerTargets.filter(
    (coord) => !game.previousComputerShots.has(serializeCoordinate(coord)),
  );
  if (availableTargets.length > 0) {
    return availableTargets[0];
  }

  const remainingShots: Coordinate[] = [];
  for (let row = 0; row < 10; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      const key = serializeCoordinate({ row, col });
      if (!game.previousComputerShots.has(key)) {
        remainingShots.push({ row, col });
      }
    }
  }

  if (remainingShots.length === 0) return null;
  return remainingShots[Math.floor(Math.random() * remainingShots.length)];
}

function buildShipCellsPreview(game: GameState, size: number) {
  if (game.phase !== "placement" || !game.hoveredCell) return null;
  return buildShipCells(game.hoveredCell.row, game.hoveredCell.col, size, game.orientation);
}
