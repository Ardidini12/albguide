import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DestinationForm } from './DestinationForm';
import { DestinationList } from './DestinationList';

export default async function AdminDestinationsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/login');
  }

  const supabase = await createSupabaseServerClient();

  const { data: destinations } = await supabase.from('destinations').select('*');

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
          <h1 className="text-3xl font-bold text-gray-800">Destinations Management</h1>
          <p className="text-gray-600 mt-2">Create and manage destination guides</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DestinationForm />
          </div>
          <div className="lg:col-span-2">
            <DestinationList destinations={destinations || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
