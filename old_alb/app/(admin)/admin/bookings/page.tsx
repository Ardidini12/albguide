import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BookingsTable } from './BookingsTable';

export default async function AdminBookingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/login');
  }

  const supabase = await createSupabaseServerClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      package:packages(title, price),
      user:profiles(email, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
          <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
          <p className="text-gray-600 mt-2">View and manage all customer bookings</p>
        </div>

        <BookingsTable bookings={bookings || []} />
      </div>
    </div>
  );
}
