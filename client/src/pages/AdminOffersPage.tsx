import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createOffer, deleteOffer, getOffers, type Offer, updateOffer } from '../services/offers';
import { format } from 'date-fns';

export function AdminOffersPage() {
 const { token } = useAuth();
 const [offers, setOffers] = useState<Offer[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isEditing, setIsEditing] = useState<Offer | null>(null);
 const [isCreating, setIsCreating] = useState(false);

 // Form State
 const [formData, setFormData] = useState({
  title: '',
  description: '',
  discount_percentage: 0,
  code: '',
  valid_from: '',
  valid_to: '',
  is_active: true
 });

 const fetchOffers = async () => {
  try {
   if (!token) return;
   const data = await getOffers(token);
   setOffers(data.offers);
  } catch (err) {
   console.error(err);
  } finally {
   setIsLoading(false);
  }
 };

 useEffect(() => {
  fetchOffers();
 }, [token]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) return;

  try {
   const payload = {
    ...formData,
    valid_from: formData.valid_from || null,
    valid_to: formData.valid_to || null,
    code: formData.code || null
   };

   if (isEditing) {
    await updateOffer(isEditing.id, payload, token);
   } else {
    await createOffer(payload, token);
   }

   setIsEditing(null);
   setIsCreating(false);
   resetForm();
   fetchOffers();
  } catch (err) {
   console.error(err);
   alert('Failed to save offer');
  }
 };

 const handleDelete = async (id: string) => {
  if (!token || !confirm('Are you sure?')) return;
  try {
   await deleteOffer(id, token);
   setOffers(prev => prev.filter(o => o.id !== id));
  } catch (err) {
   console.error(err);
  }
 };

 const startEdit = (offer: Offer) => {
  setIsEditing(offer);
  setIsCreating(false);
  setFormData({
   title: offer.title,
   description: offer.description || '',
   discount_percentage: offer.discount_percentage,
   code: offer.code || '',
   valid_from: offer.valid_from ? offer.valid_from.split('T')[0] : '',
   valid_to: offer.valid_to ? offer.valid_to.split('T')[0] : '',
   is_active: offer.is_active
  });
 };

 const startCreate = () => {
  setIsCreating(true);
  setIsEditing(null);
  resetForm();
 };

 const resetForm = () => {
  setFormData({
   title: '',
   description: '',
   discount_percentage: 0,
   code: '',
   valid_from: '',
   valid_to: '',
   is_active: true
  });
 };

 if (isLoading) return <div className="p-8 text-white">Loading...</div>;

 return (
  <div className="min-h-screen bg-black pt-24 pb-12 px-4">
   <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-8">
     <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Manage Offers</h1>
     <button
      onClick={startCreate}
      className="px-6 py-2 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
     >
      Create Offer
     </button>
    </div>

    {(isCreating || isEditing) && (
     <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
      <h2 className="text-xl font-bold text-white mb-4">{isEditing ? 'Edit Offer' : 'New Offer'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
         <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Title</label>
         <input
          type="text"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors"
         />
        </div>
        <div>
         <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Discount %</label>
         <input
          type="number"
          min="0" max="100"
          required
          value={formData.discount_percentage}
          onChange={e => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors"
         />
        </div>
        <div>
         <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Code (Optional)</label>
         <input
          type="text"
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors"
         />
        </div>
        <div className="flex items-center gap-4 pt-6">
         <label className="flex items-center gap-2 cursor-pointer">
          <input
           type="checkbox"
           checked={formData.is_active}
           onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
           className="w-4 h-4 rounded border-zinc-700 bg-black text-red-600 focus:ring-red-600"
          />
          <span className="text-sm font-bold text-white">Active</span>
         </label>
        </div>
        <div>
         <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Valid From</label>
         <input
          type="date"
          value={formData.valid_from}
          onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors"
         />
        </div>
        <div>
         <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Valid To</label>
         <input
          type="date"
          value={formData.valid_to}
          onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors"
         />
        </div>
       </div>
       <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Description</label>
        <textarea
         value={formData.description}
         onChange={e => setFormData({ ...formData, description: e.target.value })}
         className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-600 outline-none transition-colors h-24"
        />
       </div>
       <div className="flex gap-2 justify-end">
        <button
         type="button"
         onClick={() => { setIsEditing(null); setIsCreating(false); }}
         className="px-6 py-2 border border-white/10 text-white rounded-lg font-bold hover:bg-white/5 transition-colors"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
        >
         Save Offer
        </button>
       </div>
      </form>
     </div>
    )}

    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
     <table className="w-full">
      <thead className="bg-black/50 border-b border-white/5">
       <tr>
        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">Title</th>
        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">Discount</th>
        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">Code</th>
        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">Status</th>
        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-zinc-500">Validity</th>
        <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-zinc-500">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
       {offers.map(offer => (
        <tr key={offer.id} className="hover:bg-white/5 transition-colors">
         <td className="px-6 py-4">
          <div className="font-bold text-white">{offer.title}</div>
          <div className="text-xs text-zinc-400">{offer.description}</div>
         </td>
         <td className="px-6 py-4">
          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
           {offer.discount_percentage}%
          </span>
         </td>
         <td className="px-6 py-4 text-sm text-zinc-300 font-mono">{offer.code || '-'}</td>
         <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${offer.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
           }`}>
           {offer.is_active ? 'Active' : 'Inactive'}
          </span>
         </td>
         <td className="px-6 py-4 text-xs text-zinc-400">
          {offer.valid_from && <div>From: {format(new Date(offer.valid_from), 'MMM d, yyyy')}</div>}
          {offer.valid_to && <div>To: {format(new Date(offer.valid_to), 'MMM d, yyyy')}</div>}
         </td>
         <td className="px-6 py-4 text-right space-x-2">
          <button
           onClick={() => startEdit(offer)}
           className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
           EDIT
          </button>
          <button
           onClick={() => handleDelete(offer.id)}
           className="text-xs font-bold text-red-600 hover:text-red-500 transition-colors"
          >
           DELETE
          </button>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>
  </div>
 );
}
