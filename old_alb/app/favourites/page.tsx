import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FavouritesList } from './FavouritesList';

export default async function FavouritesPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  const { data: favourites } = await supabase
    .from('favourites')
    .select(`
      *,
      package:packages(*),
      destination:destinations(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Favourites</h1>
        <FavouritesList favourites={favourites || []} />
      </div>
    </div>
  );
}
