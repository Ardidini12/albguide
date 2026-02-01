"use client";

import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MapPin, Sun, Utensils, Landmark, Mountain, Waves, Info } from 'lucide-react';

const destinations = [
  {
    name: 'Albanian Riviera',
    region: 'South',
    image: 'https://images.unsplash.com/photo-1738248000857-7760b1e8333d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBbGJhbmlhbiUyMHJpdmllcmF8ZW58MXx8fHwxNzYyODc3NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Stunning coastline with pristine beaches and crystal-clear waters',
    bestTime: 'May - September',
    highlights: ['Ksamil Islands', 'Saranda', 'Himarë', 'Dhërmi Beach'],
    activities: ['Beach relaxation', 'Snorkeling', 'Boat tours', 'Coastal hiking']
  },
  {
    name: 'Berat',
    region: 'Central',
    image: 'https://images.unsplash.com/photo-1705405999485-188af37e0462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZXJhdCUyMEFsYmFuaWF8ZW58MXx8fHwxNzYyODc3NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'UNESCO World Heritage city known as the "City of a Thousand Windows"',
    bestTime: 'April - October',
    highlights: ['Berat Castle', 'Mangalem Quarter', 'Gorica Bridge', 'Onufri Museum'],
    activities: ['Historical tours', 'Wine tasting', 'Photography', 'Cultural experiences']
  },
  {
    name: 'Albanian Alps',
    region: 'North',
    image: 'https://images.unsplash.com/photo-1634033855284-4cb96c9fdd66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBbGJhbmlhJTIwbW91bnRhaW5zJTIwaGlraW5nfGVufDF8fHx8MTc2Mjg3NzQ1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Breathtaking mountain landscapes and traditional villages',
    bestTime: 'June - September',
    highlights: ['Theth National Park', 'Valbona Valley', 'Blue Eye', 'Traditional guesthouses'],
    activities: ['Trekking', 'Mountain biking', 'Village tours', 'Wildlife watching']
  },
  {
    name: 'Tirana',
    region: 'Central',
    image: 'https://images.unsplash.com/photo-1705405999485-188af37e0462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZXJhdCUyMEFsYmFuaWF8ZW58MXx8fHwxNzYyODc3NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vibrant capital city with colorful architecture and rich history',
    bestTime: 'Year-round',
    highlights: ['Skanderbeg Square', 'Bunk\'Art', 'Grand Park', 'Pyramid of Tirana'],
    activities: ['City tours', 'Museums', 'Nightlife', 'Shopping']
  }
];

const travelTips = [
  {
    title: 'Currency & Money',
    icon: Info,
    tips: [
      'Albanian Lek (ALL) is the official currency',
      'Euros are widely accepted in tourist areas',
      'ATMs are readily available in cities',
      'Credit cards accepted in major establishments'
    ]
  },
  {
    title: 'Language',
    icon: Info,
    tips: [
      'Albanian is the official language',
      'English widely spoken in tourist areas',
      'Italian and Greek also common',
      'Learn basic phrases for a better experience'
    ]
  },
  {
    title: 'Getting Around',
    icon: Info,
    tips: [
      'Buses connect major cities affordably',
      'Private transfers available for inter-city travel',
      'Drive carefully on winding mountain roads',

    ]
  },
  {
    title: 'Food & Dining',
    icon: Utensils,
    tips: [
      'Try traditional byrek and tavë kosi',
      'Fresh seafood along the coast',
      'Restaurant menus often in English'
    ]
  }
];

export default function DestinationGuidesPage() {
  const [selectedRegion, setSelectedRegion] = useState('All');

  const filteredDestinations = selectedRegion === 'All' 
    ? destinations 
    : destinations.filter(d => d.region === selectedRegion);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-12 h-12" />
            <h1 className="text-5xl">Destination Guides</h1>
          </div>
          <p className="text-xl max-w-2xl">
            Comprehensive guides to help you plan and explore the best of Albania
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3">
            <Button 
              variant={selectedRegion === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('All')}
            >
              All Regions
            </Button>
            <Button 
              variant={selectedRegion === 'North' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('North')}
            >
              Northern Albania
            </Button>
            <Button 
              variant={selectedRegion === 'Central' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('Central')}
            >
              Central Albania
            </Button>
            <Button 
              variant={selectedRegion === 'South' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('South')}
            >
              Southern Albania
            </Button>
          </div>
        </div>
      </div>

      {/* Destinations */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8 mb-16">
          {filteredDestinations.map((dest, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-80">
                  <ImageWithFallback
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8">
                  <h2 className="text-3xl mb-3">{dest.name}</h2>
                  <p className="text-gray-700 mb-4">{dest.description}</p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Sun className="w-5 h-5" />
                        <span>Best Time to Visit</span>
                      </div>
                      <p className="text-gray-700 ml-7">{dest.bestTime}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Landmark className="w-5 h-5" />
                        <span>Top Highlights</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-7">
                        {dest.highlights.map((highlight, hidx) => (
                          <span key={hidx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Mountain className="w-5 h-5" />
                        <span>Activities</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-7">
                        {dest.activities.map((activity, aidx) => (
                          <span key={aidx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button size="lg">View Packages</Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Travel Tips */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl mb-8 text-center">Essential Travel Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {travelTips.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purple-700" />
                    </div>
                    <h3 className="text-xl">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.tips.map((tip, tidx) => (
                      <li key={tidx} className="flex items-start gap-2">
                        <span className="text-purple-700 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seasonal Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl mb-4 flex items-center gap-2">
                <Sun className="w-6 h-6 text-orange-500" />
                Weather & Climate
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="mb-1">Spring (March-May)</h4>
                  <p className="text-gray-600 text-sm">Mild temperatures, blooming flowers, fewer tourists</p>
                </div>
                <div>
                  <h4 className="mb-1">Summer (June-August)</h4>
                  <p className="text-gray-600 text-sm">Hot and sunny, perfect for beaches, peak season</p>
                </div>
                <div>
                  <h4 className="mb-1">Fall (September-November)</h4>
                  <p className="text-gray-600 text-sm">Pleasant weather, harvest season, good value</p>
                </div>
                <div>
                  <h4 className="mb-1">Winter (December-February)</h4>
                  <p className="text-gray-600 text-sm">Cool and rainy on coast, skiing in mountains</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl mb-4 flex items-center gap-2">
                <Waves className="w-6 h-6 text-blue-500" />
                Safety & Health
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-700 mt-1">✓</span>
                  <span className="text-gray-700 text-sm">Albania is generally very safe for tourists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-700 mt-1">✓</span>
                  <span className="text-gray-700 text-sm">Tap water is safe to drink in most areas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-700 mt-1">✓</span>
                  <span className="text-gray-700 text-sm">Emergency number: 112 (universal)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
