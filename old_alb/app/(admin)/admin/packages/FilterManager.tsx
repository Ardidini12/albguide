"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Filter {
  id: string;
  name: string;
}

interface FilterManagerProps {
  regions: Filter[];
  types: Filter[];
  onAddRegion: (name: string) => Promise<void>;
  onRemoveRegion: (id: string) => Promise<void>;
  onAddType: (name: string) => Promise<void>;
  onRemoveType: (id: string) => Promise<void>;
}

export function FilterManager({ 
  regions, 
  types, 
  onAddRegion, 
  onRemoveRegion, 
  onAddType, 
  onRemoveType 
}: FilterManagerProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddRegion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    if (name?.trim()) {
      try {
        await onAddRegion(name.trim());
        if (form) {
          form.reset();
        }
        // Refresh the page data
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add region');
      }
    }
  };

  const handleAddType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    if (name?.trim()) {
      try {
        await onAddType(name.trim());
        if (form) {
          form.reset();
        }
        // Refresh the page data
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add type');
      }
    }
  };

  const handleRemoveRegion = async (id: string) => {
    if (confirm('Are you sure you want to remove this region?')) {
      try {
        await onRemoveRegion(id);
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to remove region');
      }
    }
  };

  const handleRemoveType = async (id: string) => {
    if (confirm('Are you sure you want to remove this type?')) {
      try {
        await onRemoveType(id);
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to remove type');
      }
    }
  };

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Manage Filters</h3>
      
      {/* Region Management */}
      <div className="space-y-2">
        <form onSubmit={handleAddRegion} className="flex gap-2">
          <input 
            type="text" 
            name="name"
            placeholder="New region name" 
            className="flex-1 p-2 border rounded text-sm"
            required
          />
          <button 
            type="submit"
            disabled={isPending}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : '+ Add'}
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {regions.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No regions added yet</p>
          ) : (
            regions.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRemoveRegion(r.id)}
                disabled={isPending}
                className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 flex items-center gap-1 disabled:opacity-50"
              >
                {r.name} ×
              </button>
            ))
          )}
        </div>
      </div>

      {/* Type Management */}
      <div className="space-y-2">
        <form onSubmit={handleAddType} className="flex gap-2">
          <input 
            type="text" 
            name="name"
            placeholder="New type name" 
            className="flex-1 p-2 border rounded text-sm"
            required
          />
          <button 
            type="submit"
            disabled={isPending}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : '+ Add'}
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {types.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No types added yet</p>
          ) : (
            types.map((t) => (
              <button
                key={t.id}
                onClick={() => handleRemoveType(t.id)}
                disabled={isPending}
                className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200 flex items-center gap-1 disabled:opacity-50"
              >
                {t.name} ×
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

