import { supabase } from '../lib/supabaseClient.js';

export async function getPlayerStats(userId) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('player_stats')
    .select(
      'user_id, total_games, wins, losses, games_vs_bot, games_vs_human, win_rate, updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (
    data ?? {
      user_id: userId,
      total_games: 0,
      wins: 0,
      losses: 0,
      games_vs_bot: 0,
      games_vs_human: 0,
      win_rate: 0,
      updated_at: null,
    }
  );
}
