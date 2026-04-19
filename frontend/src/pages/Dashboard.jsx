import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Users, CalendarCheck, FileText, Stethoscope, Clock, 
  AlertCircle, ChevronRight, Download, Plus, 
  TrendingUp, TrendingDown, DollarSign, BedDouble, Settings as SettingsIcon 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const trendData = [
  { name: 'Mon', revenue: 4000, appointments: 24 },
  { name: 'Tue', revenue: 3000, appointments: 18 },
  { name: 'Wed', revenue: 5000, appointments: 29 },
  { name: 'Thu', revenue: 2780, appointments: 20 },
  { name: 'Fri', revenue: 6890, appointments: 35 },
  { name: 'Sat', revenue: 2390, appointments: 15 },
  { name: 'Sun', revenue: 3490, appointments: 21 },
];

export default function Dashboard() {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ appointments: 0, patients: 0, doctors: 0, records: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptRes, recRes] = await Promise.all([
          api.get('appointments/'),
          api.get('records/'),
        ]);
        const apts = aptRes.data || [];
        const recs = recRes.data || [];
        setAppointments(apts.slice(0, 5));
        setCounts(prev => ({ ...prev, appointments: apts.length, records: recs.length }));

        if (['Admin', 'Staff'].includes(profile.role)) {
          const [patRes, docRes] = await Promise.all([
            api.get('patients/'),
            api.get('doctors/'),
          ]);
          setCounts(prev => ({
            ...prev,
            patients: (patRes.data || []).length,
            doctors: (docRes.data || []).length,
          }));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile.role]);

  const stats = [
    { 
      label: 'Total Patients', 
      value: counts.patients.toLocaleString(), 
      trend: '+12.5%', 
      isUp: true, 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      path: '/patients' 
    },
    { 
      label: 'Appointments Today', 
      value: counts.appointments, 
      trend: '+4.3%', 
      isUp: true, 
      icon: CalendarCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      path: '/appointments' 
    },
    { 
      label: 'Doctors Available', 
      value: counts.doctors, 
      trend: '-2', 
      isUp: false, 
      icon: Stethoscope, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      path: '/doctors' 
    },
    { 
      label: 'Revenue (Monthly)', 
      value: '$124,500', 
      trend: '+8.2%', 
      isUp: true, 
      icon: DollarSign, 
      color: 'text-primary', 
      bg: 'bg-primary/5', 
      path: '#' 
    },
  ];

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: counts,
      recent_appointments: appointments
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HMS_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-primary">{profile.username}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
          <button 
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {loading ? <span className="text-slate-200 animate-pulse">---</span> : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
                <span className="text-xs text-slate-400 font-medium">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Revenue & Patient Trends</h3>
            <select className="text-xs font-bold bg-slate-50 border-none rounded-lg p-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Weekly Appointments</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-primary"></div> Scheduled
               </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="appointments" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Recent Appointments</h3>
            <button onClick={() => navigate('/appointments')} className="text-sm font-bold text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Patient / Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {(apt.patient_details?.user?.username || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">
                             {apt.patient_details?.user?.first_name ? `${apt.patient_details.user.first_name} ${apt.patient_details.user.last_name}` : apt.patient_details?.user?.username}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">Dr. {apt.doctor_details?.user?.last_name || 'Smith'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(apt.appointment_datetime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                        ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          apt.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-primary/10 text-primary'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-[150px] font-medium">
                      {apt.reason_for_visit || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {[
              { label: 'Book Appointment', icon: CalendarCheck, path: '/appointments', color: 'bg-primary' },
              { label: 'Medical Records', icon: FileText, path: '/records', color: 'bg-purple-600' },
              { label: 'Register Patient', icon: Users, path: '/patients', color: 'bg-emerald-600' },
              { label: 'System Settings', icon: SettingsIcon, path: '/settings', color: 'bg-slate-400' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white shadow-sm`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-700 group-hover:text-primary transition-colors">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <BedDouble className="w-20 h-20" />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bed Availability</p>
             <h4 className="text-3xl font-bold mb-2">18/50</h4>
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div className="bg-primary h-full w-[36%]"></div>
             </div>
             <p className="text-xs font-medium text-emerald-400">36% occupancy rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
