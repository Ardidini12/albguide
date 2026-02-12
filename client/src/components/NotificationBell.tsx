import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
 const { token } = useAuth();
 const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(token);
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
   if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    setIsOpen(false);
   }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
  <div className="relative" ref={dropdownRef}>
   <button
    onClick={() => setIsOpen(!isOpen)}
    className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:border-red-600 transition-all relative group"
   >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-red-500 transition-colors">
     <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
     <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
    {unreadCount > 0 && (
     <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-600 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950 animate-pulse">
      {unreadCount > 9 ? '9+' : unreadCount}
     </span>
    )}
   </button>

   {isOpen && (
    <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-white/10 rounded-2xl shadow-3xl py-2 z-50 backdrop-blur-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
     <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
      <h3 className="text-xs font-black uppercase italic tracking-widest text-white">Notifications</h3>
      {unreadCount > 0 && (
       <button
        onClick={() => markAllRead()}
        className="text-[10px] uppercase font-bold text-red-500 hover:text-white transition-colors"
       >
        Mark all read
       </button>
      )}
     </div>

     <div className="max-h-96 overflow-y-auto custom-scrollbar">
      {notifications.length === 0 ? (
       <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
         <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
         <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">No notifications</p>
       </div>
      ) : (
       notifications.map(n => (
        <div
         key={n.id}
         className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group ${!n.is_read ? 'bg-red-900/10' : ''}`}
         onClick={() => !n.is_read && markAsRead(n.id)}
        >
         <div className="flex justify-between items-start gap-2">
          <h4 className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{n.title}</h4>
          <span className="text-[10px] text-zinc-600 whitespace-nowrap">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
         </div>
         <p className="text-xs text-zinc-400 mt-1 line-clamp-2 group-hover:text-zinc-300">{n.message}</p>
         {!n.is_read && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-red-600"></div>
         )}
        </div>
       ))
      )}
     </div>
    </div>
   )}
  </div>
 );
}
