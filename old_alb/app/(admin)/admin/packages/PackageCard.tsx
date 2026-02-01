"use client";

import { useState } from 'react';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  region: string;
  type: string;
  duration: number;
  durationText: string;
  images: string[];
  features: string[];
  isPopular: boolean;
}

interface Filter {
  id: string;
  name: string;
}

interface PackageCardProps {
  pkg: Package;
  regions: Filter[];
  types: Filter[];
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PackageCard({ pkg, regions, types, onUpdate, onDelete }: PackageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (formData: FormData) => {
    try {
      await onUpdate(pkg.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update package:', error);
      alert('Failed to update package. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${pkg.title}"? This action cannot be undone.`)) {
      try {
        setIsDeleting(true);
        await onDelete(pkg.id);
      } catch (error) {
        console.error('Failed to delete package:', error);
        alert('Failed to delete package. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-blue-200 p-6">
        <h3 className="text-lg font-bold mb-4 text-blue-600">Edit Package</h3>
        <form action={handleEdit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Package Title</label>
            <input 
              name="title" 
              defaultValue={pkg.title}
              className="w-full p-2 border rounded mt-1" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Price (€)</label>
            <input 
              name="price" 
              type="number" 
              step="0.01" 
              defaultValue={pkg.price.toString()}
              className="w-full p-2 border rounded mt-1" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Region</label>
              <select name="region" defaultValue={pkg.region} className="w-full p-2 border rounded mt-1" required>
                {regions.length > 0 ? (
                  regions.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))
                ) : (
                  <option value={pkg.region}>{pkg.region}</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
              <select name="type" defaultValue={pkg.type} className="w-full p-2 border rounded mt-1" required>
                {types.length > 0 ? (
                  types.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))
                ) : (
                  <option value={pkg.type}>{pkg.type}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Location Label</label>
            <input 
              name="location" 
              defaultValue={pkg.location}
              className="w-full p-2 border rounded mt-1" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Days (Num)</label>
              <input 
                name="duration" 
                type="number" 
                defaultValue={pkg.duration}
                className="w-full p-2 border rounded mt-1" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Duration Text</label>
              <input 
                name="durationText" 
                defaultValue={pkg.durationText}
                className="w-full p-2 border rounded mt-1" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Image Link</label>
            <input 
              name="imageUrl" 
              defaultValue={pkg.images[0] || ''}
              className="w-full p-2 border rounded mt-1" 
              required 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              defaultValue={pkg.description}
              className="w-full p-2 border rounded mt-1" 
              required 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Features (Comma Separated)</label>
            <textarea 
              name="features" 
              rows={3} 
              defaultValue={pkg.features.join(', ')}
              className="w-full p-2 border rounded mt-1" 
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold"
            >
              Save Changes
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition">
      <div className="relative h-48 bg-gray-200">
        <img src={pkg.images[0] || '/placeholder.jpg'} alt={pkg.title} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          {pkg.type}
        </span>
        <span className="absolute top-2 right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded shadow">
          {pkg.region}
        </span>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-xl mb-1">{pkg.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{pkg.durationText} • {pkg.location}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {pkg.features.map((f: string, i: number) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
              ✓ {f}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-xs text-gray-400">Starting from</p>
            <p className="text-xl font-bold text-blue-900">€{pkg.price.toString()}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
            >
              Edit
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

