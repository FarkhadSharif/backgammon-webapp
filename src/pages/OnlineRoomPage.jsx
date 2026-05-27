import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { BackgammonBoard } from '../components/board/BackgammonBoard.jsx';
import { GameControls } from '../components/game/GameControls.jsx';
import { WinnerModal } from '../components/game/WinnerModal.jsx';
import { GameHeader } from '../components/layout/GameHeader.jsx';
import { StatusPanel } from '../components/ui/StatusPanel.jsx';
import { PLAYER_LABEL } from '../game/constants.js';
import { useBackgammonGame } from '../hooks/useBackgammonGame.js';
import { useOnlineRoom } from '../hooks/useOnlineRoom.js';
import { useGameSounds } from '../sound/useGameSounds.js';
import { useSound } from '../sound/useSound.js';
import { getAllowedBoardSkin } from '../theme/skinStorage.js';

export function OnlineRoomPage() {
  const { roomCode } = useParams();
  const { user, profile } = useAuth();
  const game = useBackgammonGame();
  const online = useOnlineRoom(roomCode, game);
  const boardSkin = getAllowedBoardSkin(profile);
  const [copyNotice, setCopyNotice] = useState('');
  const { playSound } = useSound();

  useGameSounds(online.onlineGame, {
    enabled: Boolean(online.room),
    isLocalPlayer: online.isCurrentPlayer,
  });

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(online.inviteUrl);
      setCopyNotice('Invite link copied.');
      playSound('notification');
    } catch {
      setCopyNotice('Copy failed. Select the invite link and copy it manually.');
    }
  }

  if (online.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-100 px-4 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
        <StatusPanel title="Joining online room">
          Connecting to Supabase Realtime and loading the shared board.
        </StatusPanel>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-2 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
        <GameHeader />

        {online.error ? (
          <StatusPanel
            tone="error"
            title="Online room issue"
            action={
              <Link
                className="inline-flex min-h-11 items-center rounded bg-red-800 px-4 py-2 text-sm font-black text-white transition hover:bg-red-900"
                to="/game"
              >
                Back to Game
              </Link>
            }
          >
            {online.error}
          </StatusPanel>
        ) : null}

        {online.isWaiting ? (
          <section className="grid min-h-[24rem] place-items-center rounded-lg border border-stone-300 bg-white p-5 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <div className="max-w-lg">
              <p className="text-sm font-bold uppercase tracking-wide text-red-800 dark:text-red-300">
                Online room
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-4xl">
                Waiting for opponent
              </h1>
              <p className="mt-3 text-sm font-semibold text-stone-600 dark:text-stone-300">
                Share this invite link with another signed-in player.
              </p>
              <input
                className="mt-5 w-full rounded border border-stone-300 bg-stone-50 p-3 text-center text-sm font-bold text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
                value={online.inviteUrl}
                readOnly
                onFocus={(event) => event.target.select()}
              />
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  className="min-h-11 rounded bg-red-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-900"
                  type="button"
                  onClick={copyInvite}
                >
                  Copy Invite Link
                </button>
                <Link
                  className="min-h-11 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:bg-stone-800"
                  to="/game"
                >
                  Back
                </Link>
              </div>
              {copyNotice ? (
                <p className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {copyNotice}
                </p>
              ) : null}
            </div>
          </section>
        ) : (
          <>
            <OnlineRoomStatus online={online} userId={user.id} />
            <GameControls
              currentPlayer={online.onlineGame.currentPlayer}
              dice={online.onlineGame.dice}
              gameStatus={online.onlineGame.gameStatus}
              isInteractionDisabled={!online.isCurrentPlayer}
              statusText={
                online.isCurrentPlayer
                  ? `Your turn (${PLAYER_LABEL[online.playerColor]})`
                  : 'Opponent turn'
              }
              skin={boardSkin}
              onRollDice={online.onlineGame.rollDice}
              onEndTurn={online.onlineGame.endTurn}
              onSurrender={online.onlineGame.surrender}
              onResetGame={online.goHome}
            />
            <BackgammonBoard
              game={online.onlineGame}
              interactionDisabled={!online.isCurrentPlayer}
              skin={boardSkin}
            />
          </>
        )}
      </div>
      <WinnerModal
        winner={online.onlineGame.winner}
        onPlayAgain={online.goHome}
        coachReport={online.coachReport}
        isCoachLoading={online.isCoachLoading}
        coachError={online.coachError}
      />
    </main>
  );
}

function OnlineRoomStatus({ online }) {
  const connected = online.connectionStatus === 'connected';

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-300 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Room
        </p>
        <p className="text-sm font-black text-stone-950 dark:text-stone-50">
          {online.room.room_code}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Connection
        </p>
        <p className={`text-sm font-black ${connected ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
          {connected ? 'Connected' : 'Disconnected'} · {online.presenceCount} online
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Turn
        </p>
        <p className="text-sm font-black text-stone-950 dark:text-stone-50">
          {online.isCurrentPlayer ? 'You can move' : 'Waiting'}
        </p>
      </div>
    </section>
  );
}
