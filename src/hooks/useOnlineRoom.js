import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { GAME_STATUS, PLAYERS } from '../game/constants.js';
import { getOpponent } from '../game/rules.js';
import { supabase } from '../lib/supabaseClient.js';
import { getOrCreateCoachReport } from '../services/aiCoachService.js';
import {
  finishOnlineMatch,
  getRoomByCode,
  joinOnlineRoom,
  recordOnlineMove,
  ROOM_STATUS,
  updateOnlineRoomState,
} from '../services/roomService.js';

export function useOnlineRoom(roomCode, game) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [presenceCount, setPresenceCount] = useState(1);
  const [coachReport, setCoachReport] = useState(null);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');
  const applyingRemoteRef = useRef(false);
  const pendingLocalSyncRef = useRef(false);
  const skipNextSyncRef = useRef(false);
  const lastSyncedVersionRef = useRef(0);
  const finishedMatchRef = useRef(null);
  const moveLogQueueRef = useRef(Promise.resolve());

  const playerColor = useMemo(() => {
    if (!room || !user) {
      return null;
    }

    if (room.host_id === user.id) {
      return PLAYERS.white;
    }

    if (room.guest_id === user.id) {
      return PLAYERS.black;
    }

    return null;
  }, [room, user]);

  const isCurrentPlayer = room?.status === ROOM_STATUS.active && playerColor === game.currentPlayer;
  const isWaiting = room?.status === ROOM_STATUS.waiting;

  const snapshot = useMemo(
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

    async function loadRoom() {
      try {
        setLoading(true);
        setError('');

        const foundRoom = await getRoomByCode(roomCode);

        if (!foundRoom) {
          throw new Error('Room not found.');
        }

        const joinedRoom = await joinOnlineRoom(foundRoom, user.id);

        if (!isMounted) {
          return;
        }

        setRoom(joinedRoom);
        applyRoomState(joinedRoom);
      } catch (roomError) {
        if (isMounted) {
          setError(roomError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
    };
    // Room loading should run only for a room/user change; game hydration is handled via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, user.id]);

  useEffect(() => {
    if (!room?.id || !supabase) {
      return undefined;
    }

    const channel = supabase.channel(`room:${room.room_code}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new);
          applyRoomState(payload.new);
        },
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceCount(Object.keys(state).length);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          channel.track({ user_id: user.id, online_at: new Date().toISOString() });
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      channel.unsubscribe();
    };
    // Keep one realtime subscription per room; callbacks read the latest payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, room?.room_code, user.id]);

  useEffect(() => {
    if (!room || loading || game.stateVersion === lastSyncedVersionRef.current) {
      return;
    }

    if (skipNextSyncRef.current || applyingRemoteRef.current) {
      skipNextSyncRef.current = false;
      lastSyncedVersionRef.current = game.stateVersion;
      return;
    }

    if (
      !pendingLocalSyncRef.current &&
      !isCurrentPlayer &&
      game.gameStatus !== GAME_STATUS.finished
    ) {
      return;
    }

    pendingLocalSyncRef.current = false;
    lastSyncedVersionRef.current = game.stateVersion;
    syncLocalState();
    // Sync only when the game version changes; syncLocalState uses the current snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.stateVersion, isCurrentPlayer, loading, room, snapshot]);

  useEffect(() => {
    if (
      !room?.match_id ||
      !user ||
      snapshot.boardState.gameStatus !== GAME_STATUS.finished ||
      coachReport
    ) {
      return;
    }

    let isActive = true;
    setIsCoachLoading(true);
    setCoachError('');

    moveLogQueueRef.current
      .catch(() => undefined)
      .then(() => getOrCreateCoachReport({ matchId: room.match_id, userId: user.id }))
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
  }, [coachReport, room?.match_id, snapshot.boardState.gameStatus, user]);

  function applyRoomState(nextRoom) {
    applyingRemoteRef.current = true;
    skipNextSyncRef.current = true;
    game.loadGame({
      boardState: nextRoom.board_state,
      diceState: nextRoom.dice_state,
    });
    window.setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 0);
  }

  async function syncLocalState() {
    if (!room) {
      return;
    }

    const currentTurnUserId = getCurrentTurnUserId(room, snapshot.boardState.currentPlayer);
    const roomStatus =
      snapshot.boardState.gameStatus === GAME_STATUS.finished
        ? ROOM_STATUS.finished
        : ROOM_STATUS.active;

    try {
      await updateOnlineRoomState({
        roomId: room.id,
        roomUpdate: {
          status: roomStatus,
          game_state: snapshot,
          board_state: snapshot.boardState,
          dice_state: snapshot.diceState,
          current_turn: roomStatus === ROOM_STATUS.finished ? null : currentTurnUserId,
          finished_at:
            roomStatus === ROOM_STATUS.finished ? new Date().toISOString() : room.finished_at,
        },
      });

      if (game.lastMoveLog) {
        moveLogQueueRef.current = moveLogQueueRef.current
          .catch(() => undefined)
          .then(() =>
            recordOnlineMove({
              matchId: room.match_id,
              playerId: user.id,
              moveLog: game.lastMoveLog,
            }),
          );
        await moveLogQueueRef.current;
      }

      if (
        snapshot.boardState.gameStatus === GAME_STATUS.finished &&
        room.match_id &&
        finishedMatchRef.current !== room.match_id
      ) {
        finishedMatchRef.current = room.match_id;
        await finishOnlineMatch({
          matchId: room.match_id,
          winnerId: getWinnerUserId(room, snapshot.boardState.winner),
          winnerColor: snapshot.boardState.winner,
          snapshot,
        });
      }
    } catch (syncError) {
      setError(syncError.message);
    }
  }

  function rollDice() {
    if (!isCurrentPlayer) {
      return false;
    }

    const didRoll = game.rollDice();
    if (didRoll) {
      pendingLocalSyncRef.current = true;
    }

    return didRoll;
  }

  function endTurn() {
    if (!isCurrentPlayer) {
      return false;
    }

    const didEndTurn = game.endTurn();
    if (didEndTurn) {
      pendingLocalSyncRef.current = true;
    }

    return didEndTurn;
  }

  function surrender() {
    if (room?.status !== ROOM_STATUS.active || !playerColor) {
      return false;
    }

    const shouldSurrender = window.confirm('Surrender this online match?');
    if (!shouldSurrender) {
      return false;
    }

    const didSurrender = game.surrender(getOpponent(playerColor));
    if (didSurrender) {
      pendingLocalSyncRef.current = true;
    }

    return didSurrender;
  }

  function selectSource(source) {
    if (!isCurrentPlayer) {
      return;
    }

    game.selectSource(source);
  }

  function moveTo(destination) {
    if (!isCurrentPlayer) {
      return false;
    }

    const didMove = game.moveTo(destination);
    if (didMove) {
      pendingLocalSyncRef.current = true;
    }

    return didMove;
  }

  const onlineGame = {
    ...game,
    rollDice,
    endTurn,
    surrender,
    selectSource,
    moveTo,
  };

  return {
    room,
    onlineGame,
    playerColor,
    loading,
    error,
    isWaiting,
    isCurrentPlayer,
    connectionStatus,
    presenceCount,
    coachReport,
    isCoachLoading,
    coachError,
    inviteUrl: room ? `${window.location.origin}/room/${room.room_code}` : '',
    goHome: () => navigate('/game'),
  };
}

function getCurrentTurnUserId(room, currentPlayer) {
  return currentPlayer === PLAYERS.white ? room.host_id : room.guest_id;
}

function getWinnerUserId(room, winnerColor) {
  if (winnerColor === PLAYERS.white) {
    return room.host_id;
  }

  if (winnerColor === PLAYERS.black) {
    return room.guest_id;
  }

  return null;
}
