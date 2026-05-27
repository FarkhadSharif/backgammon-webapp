import { supabase } from '../lib/supabaseClient.js';

const LEADERBOARD_LIMIT = 25;

export async function getLeaderboard({ city } = {}) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const [global, local] = await Promise.all([
    getLeaderboardRows(),
    city ? getLeaderboardRows(city) : Promise.resolve([]),
  ]);

  return { global, local };
}

async function getLeaderboardRows(city) {
  let query = supabase
    .from('leaderboard_entries')
    .select(
      'user_id, display_name, avatar_url, city, total_games, wins, losses, win_rate, rank_score, updated_at',
    )
    .order('rank_score', { ascending: false })
    .order('wins', { ascending: false })
    .order('win_rate', { ascending: false })
    .order('total_games', { ascending: false })
    .limit(LEADERBOARD_LIMIT);

  if (city) {
    query = query.ilike('city', city);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}
