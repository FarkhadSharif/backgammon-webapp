import { BackgammonBoard } from '../components/board/BackgammonBoard.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { GameControls } from '../components/game/GameControls.jsx';
import { MatchStartPanel } from '../components/game/MatchStartPanel.jsx';
import { StrategyTipBar } from '../components/game/StrategyTipBar.jsx';
import { WinnerModal } from '../components/game/WinnerModal.jsx';
import { GAME_STATUS, PLAYERS } from '../game/constants.js';
import { OPPONENT_TYPES } from '../game/matchTypes.js';
import { getOpponent } from '../game/rules.js';
import { useBackgammonBot } from '../hooks/useBackgammonBot.js';
import { GameHeader } from '../components/layout/GameHeader.jsx';
import { useBackgammonGame } from '../hooks/useBackgammonGame.js';
import { usePersistedMatch } from '../hooks/usePersistedMatch.js';
import { createOnlineRoom } from '../services/roomService.js';
import { useGameSounds } from '../sound/useGameSounds.js';
import { useSound } from '../sound/useSound.js';
import { getAllowedBoardSkin } from '../theme/skinStorage.js';

const QUICK_MATCH_SECONDS = 5 * 60;

export function GamePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const game = useBackgammonGame();
  const persistedMatch = usePersistedMatch(game);
  const [trainingMode, setTrainingMode] = useState('standard');
  const [activeTrainingMode, setActiveTrainingMode] = useState('standard');
  const [quickMatchTimeLeft, setQuickMatchTimeLeft] = useState(null);
  const boardSkin = getAllowedBoardSkin(profile);
  const isBotGame = persistedMatch.match?.opponentType === OPPONENT_TYPES.bot;
  const isBotTurn = isBotGame && game.currentPlayer === PLAYERS.black;
  const bot = useBackgammonBot(game, Boolean(persistedMatch.match) && isBotTurn);
  const isBeginnerMode = activeTrainingMode === 'beginner' || activeTrainingMode === 'quick';
  const { playSound } = useSound();

  useGameSounds(game, { enabled: Boolean(persistedMatch.match), isLocalPlayer: true });

  useEffect(() => {
    if (
      activeTrainingMode !== 'quick' ||
      !persistedMatch.match ||
      game.gameStatus === GAME_STATUS.finished
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setQuickMatchTimeLeft((current) => {
        if (current === null || current <= 0) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeTrainingMode, game.gameStatus, persistedMatch.match]);

  useEffect(() => {
    if (
      activeTrainingMode !== 'quick' ||
      !persistedMatch.match ||
      quickMatchTimeLeft !== 0 ||
      game.gameStatus === GAME_STATUS.finished
    ) {
      return;
    }

    game.surrender(getQuickMatchWinner(game));
  }, [activeTrainingMode, game, persistedMatch.match, quickMatchTimeLeft]);

  async function handleCreateOnlineGame() {
    try {
      const room = await createOnlineRoom(user.id);
      navigate(`/room/${room.room_code}`);
    } catch (roomError) {
      window.alert(`Could not create online game: ${roomError.message}`);
    }
  }

  async function handleStartMatch(opponentType) {
    setActiveTrainingMode(trainingMode);
    setQuickMatchTimeLeft(trainingMode === 'quick' ? QUICK_MATCH_SECONDS : null);
    await persistedMatch.startMatch(opponentType);
    playSound('matchStart');
  }

  async function handlePlayAgain() {
    setActiveTrainingMode('standard');
    setQuickMatchTimeLeft(null);
    await persistedMatch.playAgain();
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-2 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
        <GameHeader />
        {persistedMatch.match ? (
          <>
            <GameControls
              currentPlayer={game.currentPlayer}
              dice={game.dice}
              gameStatus={game.gameStatus}
              isInteractionDisabled={isBotTurn}
              statusText={isBotTurn ? 'Bot thinking...' : isBotGame ? 'Vs bot' : 'Local 2 player'}
              skin={boardSkin}
              onRollDice={game.rollDice}
              onEndTurn={game.endTurn}
              onResetGame={handlePlayAgain}
            />
            <StrategyTipBar
              game={game}
              isBeginnerMode={isBeginnerMode}
              quickMatchTimeLeft={quickMatchTimeLeft}
            />
            {persistedMatch.error ? (
              <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                {persistedMatch.error}
              </p>
            ) : null}
            <BackgammonBoard
              game={game}
              interactionDisabled={isBotTurn || bot.isThinking}
              skin={boardSkin}
            />
          </>
        ) : (
          <MatchStartPanel
            unfinishedMatch={persistedMatch.unfinishedMatch}
            opponentType={persistedMatch.opponentType}
            trainingMode={trainingMode}
            isLoadingSavedGame={persistedMatch.isLoadingSavedGame}
            isCreating={persistedMatch.isCreating}
            error={persistedMatch.error}
            onOpponentTypeChange={persistedMatch.setOpponentType}
            onTrainingModeChange={setTrainingMode}
            onContinueMatch={persistedMatch.continueMatch}
            onStartMatch={handleStartMatch}
            onCreateOnlineGame={handleCreateOnlineGame}
          />
        )}
      </div>
      {persistedMatch.isSavingProgress || persistedMatch.isSavingFinish ? (
        <div className="fixed bottom-4 right-4 z-40 rounded border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-lg dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
          {persistedMatch.isSavingFinish ? 'Saving match result...' : 'Saving progress...'}
        </div>
      ) : null}
      <WinnerModal
        winner={game.winner}
        onPlayAgain={handlePlayAgain}
        coachReport={persistedMatch.coachReport}
        isCoachLoading={persistedMatch.isCoachLoading}
        coachError={persistedMatch.coachError}
      />
    </main>
  );
}

function getQuickMatchWinner(game) {
  if (game.borneOff.white > game.borneOff.black) {
    return PLAYERS.white;
  }

  if (game.borneOff.black > game.borneOff.white) {
    return PLAYERS.black;
  }

  return getOpponent(game.currentPlayer);
}
