import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Header } from './Header';

export async function HeaderWrapper() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, role')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return <Header user={user} profile={profile} />;
}
