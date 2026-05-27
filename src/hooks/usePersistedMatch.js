import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { GAME_STATUS, PLAYERS } from '../game/constants.js';
import { MATCH_STATUS, OPPONENT_TYPES } from '../game/matchTypes.js';
import {
  abandonMatch,
  createMatch,
  finishMatch,
  getUnfinishedMatch,
  recordMatchMove,
  updateMatchProgress,
} from '../services/matchService.js';
import { getOrCreateCoachReport } from '../services/aiCoachService.js';

const initialDiceState = {
  values: [],
  remaining: [],
  hasRolled: false,
};

export function usePersistedMatch(game) {
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [unfinishedMatch, setUnfinishedMatch] = useState(null);
  const [opponentType, setOpponentType] = useState(OPPONENT_TYPES.localHuman);
  const [isLoadingSavedGame, setIsLoadingSavedGame] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSavingFinish, setIsSavingFinish] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [coachReport, setCoachReport] = useState(null);
  const [coachError, setCoachError] = useState('');
  const [error, setError] = useState('');
  const finishedMatchIdRef = useRef(null);
  const skipNextProgressSaveRef = useRef(false);
  const lastSavedSnapshotRef = useRef('');
  const lastLoggedMoveRef = useRef('');
  const moveLogQueueRef = useRef(Promise.resolve());

  const gameSnapshot = useMemo(
    () => ({
      boardState: {
        board: game.board,
        captured: game.captured,
        borneOff: game.borneOff,
        currentPlayer: game.currentPlayer,
        gameStatus: game.gameStatus,
        winner: game.winner,
      },
      diceState: game.dice,
    }),
    [
      game.board,
      game.borneOff,
      game.captured,
      game.currentPlayer,
      game.dice,
      game.gameStatus,
      game.winner,
    ],
  );

  useEffect(() => {
    let isMounted = true;

    getUnfinishedMatch()
      .then((savedMatch) => {
        if (!isMounted) {
          return;
        }

        setUnfinishedMatch(savedMatch);
        if (savedMatch?.opponent_type) {
          setOpponentType(savedMatch.opponent_type);
        }
      })
      .catch((matchError) => {
        if (isMounted) {
          setError(matchError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSavedGame(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function startMatch(nextOpponentType = opponentType) {
    if (!user) {
      return;
    }

    if (unfinishedMatch) {
      const shouldReplace = window.confirm(
        'Starting a new game will abandon your saved unfinished game. Continue?',
      );

      if (!shouldReplace) {
        return;
      }

      await abandonMatch(unfinishedMatch.id);
      setUnfinishedMatch(null);
    }

    setIsCreating(true);
    setError('');
    finishedMatchIdRef.current = null;
    lastSavedSnapshotRef.current = '';
    lastLoggedMoveRef.current = '';
    moveLogQueueRef.current = Promise.resolve();
    setCoachReport(null);
    setCoachError('');

    try {
      game.resetGame();
      const createdMatch = await createMatch({
        userId: user.id,
        opponentType: nextOpponentType,
        gameSnapshot: {
          boardState: buildInitialBoardState(game),
          diceState: initialDiceState,
        },
      });

      setOpponentType(nextOpponentType);
      setMatch({
        ...createdMatch,
        opponentType: nextOpponentType,
        status: MATCH_STATUS.inProgress,
      });
      skipNextProgressSaveRef.current = true;
    } catch (matchError) {
      setError(matchError.message);
    } finally {
      setIsCreating(false);
    }
  }

  function continueMatch() {
    if (!unfinishedMatch) {
      return;
    }

    game.loadGame({
      boardState: unfinishedMatch.board_state,
      diceState: unfinishedMatch.dice_state,
    });

    setMatch({
      id: unfinishedMatch.id,
      opponentType: unfinishedMatch.opponent_type,
      status: unfinishedMatch.status,
      started_at: unfinishedMatch.started_at,
    });
    setOpponentType(unfinishedMatch.opponent_type);
    setUnfinishedMatch(null);
    skipNextProgressSaveRef.current = true;
    lastSavedSnapshotRef.current = JSON.stringify({
      boardState: unfinishedMatch.board_state,
      diceState: unfinishedMatch.dice_state,
    });
  }

  async function playAgain() {
    if (match?.status === MATCH_STATUS.inProgress && game.gameStatus === GAME_STATUS.playing) {
      const shouldReset = window.confirm(
        'Resetting now will abandon your saved unfinished game. Continue?',
      );

      if (!shouldReset) {
        return;
      }

      try {
        await abandonMatch(match.id);
      } catch (matchError) {
        setError(matchError.message);
        return;
      }
    }

    setMatch(null);
    setUnfinishedMatch(null);
    finishedMatchIdRef.current = null;
    lastSavedSnapshotRef.current = '';
    lastLoggedMoveRef.current = '';
    moveLogQueueRef.current = Promise.resolve();
    setCoachReport(null);
    setCoachError('');
    game.resetGame();
  }

  useEffect(() => {
    if (!match || game.gameStatus !== GAME_STATUS.playing) {
      return undefined;
    }

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [game.gameStatus, match]);

  useEffect(() => {
    if (!match || !user || game.gameStatus !== GAME_STATUS.playing) {
      return;
    }

    if (skipNextProgressSaveRef.current) {
      skipNextProgressSaveRef.current = false;
      return;
    }

    const snapshotKey = JSON.stringify(gameSnapshot);
    if (snapshotKey === lastSavedSnapshotRef.current) {
      return;
    }

    const saveTimer = window.setTimeout(() => {
      setIsSavingProgress(true);
      updateMatchProgress({
        matchId: match.id,
        userId: user.id,
        gameSnapshot,
      })
        .then(() => {
          lastSavedSnapshotRef.current = snapshotKey;
        })
        .catch((matchError) => setError(matchError.message))
        .finally(() => setIsSavingProgress(false));
    }, 250);

    return () => window.clearTimeout(saveTimer);
  }, [game.gameStatus, gameSnapshot, match, user]);

  useEffect(() => {
    if (!match || !user || !game.lastMoveLog) {
      return;
    }

    const moveLogKey = game.lastMoveLog.timestamp;
    if (lastLoggedMoveRef.current === moveLogKey) {
      return;
    }

    lastLoggedMoveRef.current = moveLogKey;

    moveLogQueueRef.current = moveLogQueueRef.current
      .catch(() => undefined)
      .then(() =>
        recordMatchMove({
          matchId: match.id,
          playerId: user.id,
          moveLog: game.lastMoveLog,
        }),
      )
      .catch((matchError) => setError(matchError.message));
  }, [game.lastMoveLog, match, user]);

  useEffect(() => {
    if (
      !match ||
      !user ||
      game.gameStatus !== GAME_STATUS.finished ||
      finishedMatchIdRef.current === match.id
    ) {
      return;
    }

    const winnerId = game.winner === PLAYERS.white ? user.id : null;
    finishedMatchIdRef.current = match.id;
    setIsSavingFinish(true);
    setError('');

    finishMatch({
      matchId: match.id,
      winnerId,
      winnerColor: game.winner,
      gameSnapshot,
    })
      .then((savedMatch) => {
        setMatch((current) =>
          current
            ? {
                ...current,
                ...savedMatch,
                status: MATCH_STATUS.finished,
              }
            : current,
        );
      })
      .catch((matchError) => {
        finishedMatchIdRef.current = null;
        setError(matchError.message);
      })
      .finally(() => setIsSavingFinish(false));
  }, [game.gameStatus, game.winner, gameSnapshot, match, user]);

  useEffect(() => {
    if (!match || !user || match.status !== MATCH_STATUS.finished || coachReport) {
      return;
    }

    let isActive = true;
    setIsCoachLoading(true);
    setCoachError('');

    moveLogQueueRef.current
      .catch(() => undefined)
      .then(() => getOrCreateCoachReport({ matchId: match.id, userId: user.id }))
      .then((report) => {
        if (isActive) {
          setCoachReport(report);
        }
      })
      .catch((reportError) => {
        if (isActive) {
          setCoachError(reportError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsCoachLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [coachReport, match, user]);

  return {
    match,
    unfinishedMatch,
    opponentType,
    isLoadingSavedGame,
    isCreating,
    isSavingProgress,
    isSavingFinish,
    isCoachLoading,
    coachReport,
    coachError,
    error,
    startMatch,
    continueMatch,
    playAgain,
    setOpponentType,
  };
}

function buildInitialBoardState(game) {
  return {
    board: game.board,
    captured: game.captured,
    borneOff: game.borneOff,
    currentPlayer: PLAYERS.white,
    gameStatus: GAME_STATUS.playing,
    winner: null,
  };
}
