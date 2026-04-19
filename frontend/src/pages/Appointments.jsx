import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { 
  Calendar, Clock, Search, 
  CheckCircle2, XCircle, Plus, ChevronRight, 
  CalendarCheck, CalendarRange, AlertCircle 
} from 'lucide-react';

export default function Appointments() {
  const { profile } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    doctor: '', patient: '', appointment_datetime: '', reason_for_visit: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aptRes, docRes, patRes] = await Promise.all([
        api.get('appointments/'),
        api.get('doctors/'),
        api.get('patients/'),
      ]);
      setAppointments(aptRes.data);
      setDoctors(docRes.data);
      setPatients(patRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (profile.role === 'Patient') {
        const myProfile = patients.find(p => p.user.id === profile.id);
        data.patient = myProfile?.id;
      }
      await api.post('appointments/', data);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert('Failed to book appointment.'); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`appointments/${id}/`, { status: newStatus });
      fetchData();
    } catch (err) { alert('Failed to update status.'); }
  };

  const filtered = appointments.filter(apt => {
    const statusMatch = filterStatus === 'All' || apt.status === filterStatus;
    const searchMatch = (apt.patient_details?.user?.username || '').toLowerCase().includes(search.toLowerCase()) ||
                        (apt.doctor_details?.user?.last_name || '').toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Scheduled', value: appointments.filter(a=>a.status==='Scheduled').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: appointments.filter(a=>a.status==='Confirmed').length, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cancelled', value: appointments.filter(a=>a.status==='Cancelled').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Appointments</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage and track all medical consultations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-2 gap-2 flex-wrap md:flex-nowrap">
        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient or doctor name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm px-3 py-3 w-full text-slate-700 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 p-1">
          {['All', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Patient / Doctor</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-bold">
                        {(apt.patient_details?.user?.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">
                           {apt.patient_details?.user?.first_name ? `${apt.patient_details.user.first_name} ${apt.patient_details.user.last_name}` : apt.patient_details?.user?.username}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium italic">with Dr. {apt.doctor_details?.user?.last_name || 'Staff'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{new Date(apt.appointment_datetime).toLocaleDateString()}</span>
                      <span className="text-xs text-slate-400 font-medium">{new Date(apt.appointment_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                      ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        apt.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        apt.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium max-w-[200px] truncate">
                    {apt.reason_for_visit || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {['Admin', 'Doctor', 'Staff'].includes(profile.role) && apt.status === 'Scheduled' && (
                         <>
                           <button 
                            onClick={() => handleStatusUpdate(apt.id, 'Confirmed')}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all" title="Confirm"
                           >
                             <CheckCircle2 className="w-5 h-5" />
                           </button>
                           <button 
                            onClick={() => handleStatusUpdate(apt.id, 'Cancelled')}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all" title="Cancel"
                           >
                             <XCircle className="w-5 h-5" />
                           </button>
                         </>
                       )}
                       <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-slate-400">
                    <CalendarRange className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-bold">No appointments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">New Appointment</h3>
                <p className="text-xs text-slate-500 mt-0.5">Schedule a consultation with our medical staff.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">&times;</button>
            </div>
            <form onSubmit={handleBooking} className="p-8 space-y-6">
              <div className="space-y-4">
                {profile.role !== 'Patient' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Select Patient *</label>
                    <select required onChange={e=>setFormData({...formData, patient: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                      <option value="">Search Patient</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.user.username} ({p.user.first_name} {p.user.last_name})</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Select Doctor *</label>
                  <select required onChange={e=>setFormData({...formData, doctor: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                    <option value="">Search Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user.last_name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Appointment Date & Time *</label>
                  <input required type="datetime-local" onChange={e=>setFormData({...formData, appointment_datetime: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Reason for Visit</label>
                  <textarea rows="3" onChange={e=>setFormData({...formData, reason_for_visit: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Briefly describe the symptoms or reason..."></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Schedule Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
