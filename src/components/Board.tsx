import { BOARD_SIZE, ShipId } from "../game/config";
import { BoardState, Coordinate } from "../game/types";
import { isShipSunk } from "../game/helpers";

type BoardProps = {
  board: BoardState<ShipId>;
  revealShips: boolean;
  interactive: boolean;
  onCellClick: (row: number, col: number) => void;
  preview: Coordinate[] | null;
  onCellHover: (row: number, col: number) => void;
  onBoardLeave: () => void;
};

export function Board({
  board,
  revealShips,
  interactive,
  onCellClick,
  preview,
  onCellHover,
  onBoardLeave,
}: BoardProps) {
  return (
    <div className="board-wrap" onMouseLeave={onBoardLeave}>
      <div className="board-labels top">
        <span></span>
        {Array.from({ length: BOARD_SIZE }, (_, col) => (
          <span key={`col-${col}`}>{String.fromCharCode(65 + col)}</span>
        ))}
      </div>
      <div className="board-grid">
        {board.cells.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="board-row">
            <span className="board-axis">{rowIndex + 1}</span>
            {row.map((cell, colIndex) => {
              const previewed = preview?.some((coord) => coord.row === rowIndex && coord.col === colIndex);
              const sunk = cell.shipId ? isShipSunk(board, cell.shipId) : false;
              const classes = [
                "cell",
                interactive ? "interactive" : "",
                revealShips && cell.status === "ship" ? "has-ship" : "",
                cell.status === "hit" ? (sunk ? "sunk" : "hit") : "",
                cell.status === "miss" ? "miss" : "",
                previewed ? "preview" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={classes}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => onCellHover(rowIndex, colIndex)}
                  disabled={!interactive}
                  type="button"
                  aria-label={`row ${rowIndex + 1} column ${String.fromCharCode(65 + colIndex)}`}
                >
                  {renderCellContent(cell.status, revealShips, sunk, Boolean(previewed))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCellContent(status: "idle" | "ship" | "hit" | "miss", revealShips: boolean, sunk: boolean, previewed: boolean) {
  if (status === "hit") return sunk ? "X" : "●";
  if (status === "miss") return "•";
  if (previewed) return "";
  if (revealShips && status === "ship") return "";
  return "";
}
