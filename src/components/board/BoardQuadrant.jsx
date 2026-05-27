import { Point } from './Point.jsx';
import { GAME_STATUS } from '../../game/constants.js';

export function BoardQuadrant({ points, orientation, game, interactionDisabled = false }) {
  return (
    <div className="grid grid-cols-6">
      {points.map((pointNumber, index) => (
        <Point
          key={pointNumber}
          number={pointNumber}
          orientation={orientation}
          variant={index % 2 === 0 ? 'dark' : 'light'}
          point={game.board[pointNumber]}
          isSelected={game.selectedSource === pointNumber}
          isSelectable={!interactionDisabled && game.selectableSources.includes(pointNumber)}
          isHighlighted={
            !interactionDisabled && game.highlightedDestinations.includes(pointNumber)
          }
          isDisabled={interactionDisabled || game.gameStatus === GAME_STATUS.finished}
          onSelect={() => game.selectSource(pointNumber)}
          onMove={() => game.moveTo(pointNumber)}
        />
      ))}
    </div>
  );
}
