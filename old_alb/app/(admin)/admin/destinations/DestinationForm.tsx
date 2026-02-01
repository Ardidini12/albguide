"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function DestinationForm() {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [highlights, setHighlights] = useState('');
  const [activities, setActivities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createSupabaseBrowserClient();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { error: insertError } = await supabase
        .from('destinations')
        .insert({
          name,
          slug,
          region,
          description,
          image_url: imageUrl || null,
          best_time: bestTime || null,
          highlights: highlights.split(',').map(h => h.trim()).filter(h => h),
          activities: activities.split(',').map(a => a.trim()).filter(a => a),
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setName('');
      setRegion('');
      setDescription('');
      setImageUrl('');
      setBestTime('');
      setHighlights('');
      setActivities('');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Destination</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Destination Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Albanian Riviera"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. South, North, Central"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the destination"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bestTime">Best Time to Visit</Label>
            <Input
              id="bestTime"
              value={bestTime}
              onChange={(e) => setBestTime(e.target.value)}
              placeholder="e.g. May - September"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (comma-separated)</Label>
            <Textarea
              id="highlights"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Ksamil Islands, Saranda, Himarë"
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">Activities (comma-separated)</Label>
            <Textarea
              id="activities"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Beach relaxation, Snorkeling, Boat tours"
              rows={2}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Destination'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
