"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Heart, MapPin, Star } from 'lucide-react';
import { FavouriteWithDetails } from '@/lib/types/database';

interface FavouritesListProps {
  favourites: FavouriteWithDetails[];
}

export function FavouritesList({ favourites }: FavouritesListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from('favourites').delete().eq('id', id);
      router.refresh();
    } catch (error) {
      console.error('Error removing favourite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (favourites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">No favourites yet</h2>
        <p className="text-gray-500 mb-6">Start exploring and save your favourite destinations and packages!</p>
        <Link href="/">
          <Button>Explore Packages</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favourites.map((fav) => {
        const item = fav.package || fav.destination;
        if (!item) return null;

        const isPackage = !!fav.package;
        const image = isPackage 
          ? (fav.package?.images?.[0] || '/placeholder.jpg')
          : (fav.destination?.image_url || '/placeholder.jpg');
        const title = isPackage ? fav.package?.title : fav.destination?.name;
        const link = isPackage ? `/packages/${fav.package?.slug}` : `/destinations/${fav.destination?.slug}`;

        return (
          <Card key={fav.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <ImageWithFallback
                src={image}
                alt={title || ''}
                className="w-full h-full object-cover"
              />
              {isPackage && fav.package && (
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{fav.package.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              {isPackage && fav.package && (
                <>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{fav.package.location}</span>
                  </div>
                  <p className="text-xl font-bold text-purple-600 mb-3">
                    €{fav.package.price}
                  </p>
                </>
              )}
              {!isPackage && fav.destination && (
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{fav.destination.region}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Link href={link} className="flex-1">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove(fav.id)}
                  disabled={removingId === fav.id}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
