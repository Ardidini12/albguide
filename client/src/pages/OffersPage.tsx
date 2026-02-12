import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getOffers, type Offer } from '../services/offers';

export function OffersPage() {
 const { token } = useAuth(); // Optional token, API handles it
 const [offers, setOffers] = useState<Offer[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  const fetchOffers = async () => {
   try {
    const data = await getOffers(token || undefined);
    setOffers(data.offers);
   } catch (err) {
    console.error(err);
   } finally {
    setIsLoading(false);
   }
  };
  fetchOffers();
 }, [token]);

 if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

 return (
  <div className="min-h-screen bg-black pt-32 pb-20 px-4">
   <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16 space-y-4">
     <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase">
      Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Offers</span>
     </h1>
     <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
      Limited time deals on premium Albanian experiences.
     </p>
    </div>

    {offers.length === 0 ? (
     <div className="text-center py-20 border border-white/5 rounded-3xl bg-zinc-900/50">
      <p className="text-2xl font-bold text-zinc-600">No active offers at the moment.</p>
      <p className="text-zinc-500 mt-2">Check back soon for new deals.</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {offers.map(offer => (
       <div key={offer.id} className="group relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden hover:border-red-600/50 transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]">
        <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 rounded-bl-2xl font-black text-xl italic tracking-tighter">
         -{offer.discount_percentage}%
        </div>

        <div className="p-8 pt-12 space-y-4">
         <h3 className="text-2xl font-black text-white italic tracking-tight">{offer.title}</h3>
         <p className="text-zinc-400 text-sm leading-relaxed min-h-[3rem]">{offer.description}</p>

         {offer.code && (
          <div className="bg-black border border-white/10 rounded-xl p-4 flex justify-between items-center group-hover:border-white/30 transition-colors">
           <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Code</span>
           <span className="text-lg font-mono font-bold text-red-500 tracking-wider">{offer.code}</span>
          </div>
         )}

         <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
          {offer.valid_to ? (
           <span>Expires: {new Date(offer.valid_to).toLocaleDateString()}</span>
          ) : (
           <span>Ongoing Offer</span>
          )}
         </div>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}
