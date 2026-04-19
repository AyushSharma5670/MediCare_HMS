import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, Settings, Stethoscope } from 'lucide-react';

const linkClass = (isActive) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function Sidebar({ role }) {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Doctor', 'Patient', 'Staff'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['Admin', 'Doctor', 'Staff'] },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope, roles: ['Admin', 'Staff'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Admin', 'Doctor', 'Patient', 'Staff'] },
    { name: 'Medical Records', path: '/records', icon: FileText, roles: ['Admin', 'Doctor', 'Patient'] },
  ].filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">MediCare</h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">HMS v2.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <nav className="space-y-1">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink key={name} to={path} className={({ isActive }) => linkClass(isActive)}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Settings & Bottom Section */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)}>
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
               <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {role.charAt(0)}
               </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{role}</p>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
