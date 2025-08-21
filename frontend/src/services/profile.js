import { supabase } from '../lib/supabase';

export async function loadMe() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(`Failed to get user: ${userError.message}`);

  const { data: profile, error: profileError } = await supabase
    .from('users') // or 'users' if 'user_profiles' doesn't exist
    .select('name, email, wins, games_played')
    .eq('auth_uid', user.id)
    .single();

  if (profileError) throw new Error(`Failed to load profile: ${profileError.message}`);

  return {
    name: profile.name,
    email: profile.email,
    wins: profile.wins,
    games_played: profile.games_played,
  };
}
