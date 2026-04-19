import { Bell, Search, ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header({ profile }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/patients?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex-1 flex justify-center max-w-2xl">
        <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Search patients, doctors, records... (Press Enter)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-slate-400 hover:text-primary transition-all rounded-xl hover:bg-primary/5 group">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">3</span>
        </button>
        
        <div className="h-8 w-px bg-slate-100"></div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800">
              {profile.first_name ? `Dr. ${profile.last_name}` : profile.username}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{profile.role}</span>
          </div>
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold border border-slate-200 overflow-hidden cursor-pointer shadow-sm group-hover:shadow transition-all">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            {/* Simple logout tooltip style button */}
            <button 
              onClick={handleLogout}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
