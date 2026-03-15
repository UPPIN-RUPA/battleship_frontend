import { SHIPS, ShipId } from "../game/config";
import { labelForPhase } from "../game/helpers";

type DashboardProps = {
  phase: "placement" | "battle" | "game-over";
  message: string;
  orientation: "horizontal" | "vertical";
  placementIndex: number;
  placedShipIds: ShipId[];
  playerShipsPlaced: number;
  playerShipsRemaining: number;
  computerShipsRemaining: number;
  currentTurn: "player" | "computer";
  onNewGame: () => void;
  onRotateShip: () => void;
  onRandomize: () => void;
  onResetPlacements: () => void;
};

export function Dashboard(props: DashboardProps) {
  const {
    phase,
    message,
    orientation,
    placementIndex,
    placedShipIds,
    playerShipsPlaced,
    playerShipsRemaining,
    computerShipsRemaining,
    currentTurn,
    onNewGame,
    onRotateShip,
    onRandomize,
    onResetPlacements,
  } = props;

  return (
    <section className="dashboard-grid">
      <article className="panel status-panel">
        <div className="panel-heading">
          <h2>Mission Control</h2>
          <span className={`phase-badge phase-${phase}`}>{labelForPhase(phase)}</span>
        </div>
        <p className="status-message">{message}</p>
        <div className="action-row">
          <button className="primary-button" type="button" onClick={onNewGame}>
            New Game
          </button>
          {phase === "placement" ? (
            <>
              <button className="secondary-button" type="button" onClick={onRotateShip}>
                Rotate: {orientation}
              </button>
              <button className="secondary-button" type="button" onClick={onRandomize}>
                Randomize Fleet
              </button>
              <button className="ghost-button" type="button" onClick={onResetPlacements}>
                Clear Board
              </button>
            </>
          ) : null}
        </div>
        <div className="ship-list">
          {SHIPS.map((ship, index) => {
            const placed = placedShipIds.includes(ship.id);
            const active = phase === "placement" && placementIndex === index;
            return (
              <div key={ship.id} className={`ship-pill ${placed ? "placed" : ""} ${active ? "active" : ""}`}>
                <span>{ship.label}</span>
                <span>{ship.size}</span>
              </div>
            );
          })}
        </div>
      </article>

      <article className="panel summary-panel">
        <div className="panel-heading">
          <h2>Battle Snapshot</h2>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Your ships placed</span>
            <strong>{playerShipsPlaced} / {SHIPS.length}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Enemy ships afloat</span>
            <strong>{computerShipsRemaining}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Your fleet afloat</span>
            <strong>{playerShipsRemaining}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Turn</span>
            <strong>{phase === "placement" ? "Deploying" : currentTurn === "player" ? "Your move" : "Enemy move"}</strong>
          </div>
        </div>
        <div className="legend">
          <span><i className="legend-swatch ship"></i> Ship</span>
          <span><i className="legend-swatch hit"></i> Hit</span>
          <span><i className="legend-swatch miss"></i> Miss</span>
          <span><i className="legend-swatch sunk"></i> Sunk</span>
        </div>
      </article>
    </section>
  );
}
