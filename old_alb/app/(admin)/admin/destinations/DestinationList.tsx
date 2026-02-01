"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Destination } from '@/lib/types/database';
import { Trash2, MapPin } from 'lucide-react';

interface DestinationListProps {
  destinations: Destination[];
}

export function DestinationList({ destinations }: DestinationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    setDeletingId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('destinations').delete().eq('id', id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting destination:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (destinations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No destinations yet. Create one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700">
        Existing Destinations ({destinations.length})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinations.map((dest) => (
          <Card key={dest.id}>
            <div className="relative h-48">
              <ImageWithFallback
                src={dest.image_url || '/placeholder.jpg'}
                alt={dest.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
              {dest.is_featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{dest.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{dest.region}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {dest.description}
              </p>
              
              {dest.highlights.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Highlights:</p>
                  <div className="flex flex-wrap gap-1">
                    {dest.highlights.slice(0, 3).map((highlight, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => handleDelete(dest.id)}
                disabled={deletingId === dest.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deletingId === dest.id ? 'Deleting...' : 'Delete'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
