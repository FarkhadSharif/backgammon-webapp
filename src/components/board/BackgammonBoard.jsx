import { Bar } from './Bar.jsx';
import { BorneOffArea } from './BorneOffArea.jsx';
import { BoardQuadrant } from './BoardQuadrant.jsx';
import { GAME_STATUS, OFF, PLAYERS } from '../../game/constants.js';
import { getBoardSkinVars } from '../../theme/boardSkins.js';
import { useTheme } from '../../theme/useTheme.js';

const topLeftPoints = [13, 14, 15, 16, 17, 18];
const topRightPoints = [19, 20, 21, 22, 23, 24];
const bottomLeftPoints = [12, 11, 10, 9, 8, 7];
const bottomRightPoints = [6, 5, 4, 3, 2, 1];

export function BackgammonBoard({ game, interactionDisabled = false, skin = 'classic' }) {
  const { theme } = useTheme();
  const boardSkin = getBoardSkinVars(skin, theme);
  const isKazakhHeritage = skin === 'kazakh-heritage';

  return (
    <section
      className={`board-skin relative grid min-w-0 flex-1 grid-cols-1 gap-4 transition-all duration-500 lg:grid-cols-[minmax(0,1fr)_9rem] ${isKazakhHeritage ? 'board-skin-kazakh' : ''}`}
      style={boardSkin}
    >
      <div
        className="relative min-w-0 overflow-hidden rounded-lg bg-[var(--board-frame)] p-1.5 transition-all duration-500 sm:p-3"
        style={{ boxShadow: 'var(--board-glow)' }}
      >
        {isKazakhHeritage ? <KazakhBoardDecor /> : null}
        <div className="relative z-10 grid min-h-[25rem] grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] grid-rows-2 overflow-hidden rounded bg-[var(--board-felt)] ring-2 ring-[var(--board-ring)] transition-all duration-500 sm:min-h-[36rem] sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] sm:ring-4">
          <BoardQuadrant
            points={topLeftPoints}
            orientation="down"
            game={game}
            interactionDisabled={interactionDisabled}
          />
          <Bar
            owner={PLAYERS.black}
            count={game.captured.black}
            game={game}
            interactionDisabled={interactionDisabled}
            skin={skin}
          />
          <BoardQuadrant
            points={topRightPoints}
            orientation="down"
            game={game}
            interactionDisabled={interactionDisabled}
          />
          <BoardQuadrant
            points={bottomLeftPoints}
            orientation="up"
            game={game}
            interactionDisabled={interactionDisabled}
          />
          <Bar
            owner={PLAYERS.white}
            count={game.captured.white}
            game={game}
            interactionDisabled={interactionDisabled}
            skin={skin}
          />
          <BoardQuadrant
            points={bottomRightPoints}
            orientation="up"
            game={game}
            interactionDisabled={interactionDisabled}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <BorneOffArea
          player={PLAYERS.white}
          count={game.borneOff.white}
          isHighlighted={
            game.gameStatus !== GAME_STATUS.finished &&
            !interactionDisabled &&
            game.currentPlayer === PLAYERS.white &&
            game.highlightedDestinations.includes(OFF)
          }
          onMove={() => game.moveTo(OFF)}
          skin={skin}
        />
        <BorneOffArea
          player={PLAYERS.black}
          count={game.borneOff.black}
          isHighlighted={
            game.gameStatus !== GAME_STATUS.finished &&
            !interactionDisabled &&
            game.currentPlayer === PLAYERS.black &&
            game.highlightedDestinations.includes(OFF)
          }
          onMove={() => game.moveTo(OFF)}
          skin={skin}
        />
      </div>
    </section>
  );
}

function KazakhBoardDecor() {
  return (
    <>
      <div className="kazakh-ornament kazakh-ornament-top" aria-hidden="true" />
      <div className="kazakh-ornament kazakh-ornament-bottom" aria-hidden="true" />
      <div className="kazakh-sun-motif" aria-hidden="true" />
      <div className="kazakh-eagle-motif" aria-hidden="true" />
    </>
  );
}
