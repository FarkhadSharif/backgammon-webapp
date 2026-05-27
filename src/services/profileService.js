import { supabase } from '../lib/supabaseClient.js';

export async function getProfile(userId) {
  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, display_name, avatar_url, avatar_path, city, selected_skin, pro_status, created_at, updated_at',
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mergePremiumStatus(data, await getPremiumFeatures(userId));
}

export async function upsertProfile(user, displayName, city) {
  if (!supabase || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        display_name:
          displayName || user.user_metadata?.display_name || user.email?.split('@')[0],
        city: normalizeCity(city ?? user.user_metadata?.city),
        selected_skin: 'classic',
      },
      { onConflict: 'id' },
    )
    .select(
      'id, email, display_name, avatar_url, avatar_path, city, selected_skin, pro_status, created_at, updated_at',
    )
    .single();

  if (error) {
    throw error;
  }

  return mergePremiumStatus(data, await getPremiumFeatures(user.id));
}

export async function updateProfile(userId, updates) {
  if (!supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(
      'id, email, display_name, avatar_url, avatar_path, city, selected_skin, pro_status, created_at, updated_at',
    )
    .single();

  if (error) {
    throw error;
  }

  return mergePremiumStatus(data, await getPremiumFeatures(userId));
}

async function getPremiumFeatures(userId) {
  const { data, error } = await supabase
    .from('premium_features')
    .select('pro_status, subscription_status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

function mergePremiumStatus(profile, premiumFeatures) {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    premium_features: premiumFeatures,
    pro_status: profile.pro_status === true || premiumFeatures?.pro_status === true,
  };
}

function normalizeCity(city) {
  const value = city?.trim();
  return value || null;
}

export async function uploadProfileAvatar(userId, file) {
  if (!supabase || !userId || !file) {
    return null;
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const avatarPath = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(avatarPath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(avatarPath);

  return updateProfile(userId, {
    avatar_path: avatarPath,
    avatar_url: publicUrl,
  });
}
