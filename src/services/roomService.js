import { GAME_STATUS, PLAYERS, initialBoard, initialBorneOff, initialCaptured } from '../game/constants.js';
import { MATCH_STATUS, OPPONENT_TYPES } from '../game/matchTypes.js';
import { supabase } from '../lib/supabaseClient.js';

const initialDiceState = {
  values: [],
  remaining: [],
  hasRolled: false,
};

export const ROOM_STATUS = {
  waiting: 'waiting',
  active: 'active',
  finished: 'finished',
};

export function buildInitialOnlineSnapshot() {
  return {
    boardState: {
      board: initialBoard,
      captured: initialCaptured,
      borneOff: initialBorneOff,
      currentPlayer: PLAYERS.white,
      gameStatus: GAME_STATUS.playing,
      winner: null,
    },
    diceState: initialDiceState,
  };
}

export async function createOnlineRoom(userId) {
  assertSupabase();

  const snapshot = buildInitialOnlineSnapshot();
  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .insert({
      host_id: userId,
      status: ROOM_STATUS.waiting,
      game_state: snapshot,
      board_state: snapshot.boardState,
      dice_state: snapshot.diceState,
      current_turn: userId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRoomByCode(roomCode) {
  assertSupabase();

  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function joinOnlineRoom(room, userId) {
  assertSupabase();

  if (room.host_id === userId || room.guest_id === userId) {
    return room;
  }

  if (room.status !== ROOM_STATUS.waiting || room.guest_id) {
    throw new Error('This room is no longer available.');
  }

  const match = await createOnlineMatch({
    hostId: room.host_id,
    guestId: userId,
    snapshot: {
      boardState: room.board_state,
      diceState: room.dice_state,
    },
  });

  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .update({
      guest_id: userId,
      match_id: match.id,
      status: ROOM_STATUS.active,
      started_at: new Date().toISOString(),
    })
    .eq('id', room.id)
    .eq('status', ROOM_STATUS.waiting)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOnlineRoomState({ roomId, roomUpdate }) {
  assertSupabase();

  const { error } = await supabase
    .from('multiplayer_rooms')
    .update(roomUpdate)
    .eq('id', roomId);

  if (error) {
    throw error;
  }
}

export async function finishOnlineMatch({ matchId, winnerId, winnerColor, snapshot }) {
  assertSupabase();

  if (!matchId) {
    return null;
  }

  const { data, error } = await supabase
    .from('matches')
    .update({
      status: MATCH_STATUS.finished,
      winner_id: winnerId,
      winner_color: winnerColor,
      board_state: snapshot.boardState,
      dice_state: snapshot.diceState,
      current_turn: null,
      current_turn_color: null,
      finished_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function recordOnlineMove({ matchId, playerId, moveLog }) {
  assertSupabase();

  if (!matchId || !playerId || !moveLog) {
    return;
  }

  const moveNumber = await getNextMoveNumber(matchId);

  const { error } = await supabase.from('match_moves').insert({
    match_id: matchId,
    player_id: playerId,
    move_number: moveNumber,
    dice_used: moveLog.diceUsed,
    checker_from: moveLog.checkerFrom,
    checker_to: moveLog.checkerTo,
    was_hit: moveLog.wasHit,
    was_bear_off: moveLog.wasBearOff,
    board_state_before: moveLog.boardStateBefore,
    move_data: moveLog.moveData,
    board_state_after: moveLog.boardStateAfter,
    legal_moves_available: moveLog.legalMovesAvailable,
    timestamp: moveLog.timestamp,
  });

  if (error) {
    throw error;
  }
}

async function getNextMoveNumber(matchId) {
  const { data, error } = await supabase
    .from('match_moves')
    .select('move_number')
    .eq('match_id', matchId)
    .order('move_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.move_number ?? 0) + 1;
}

function createOnlineMatch({ hostId, guestId, snapshot }) {
  return supabase
    .from('matches')
    .insert({
      player1_id: hostId,
      player2_id: guestId,
      opponent_type: OPPONENT_TYPES.humanOnline,
      status: MATCH_STATUS.inProgress,
      board_state: snapshot.boardState,
      dice_state: snapshot.diceState,
      current_turn: hostId,
      current_turn_color: snapshot.boardState.currentPlayer ?? PLAYERS.white,
    })
    .select('id')
    .single()
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      return data;
    });
}

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
}
