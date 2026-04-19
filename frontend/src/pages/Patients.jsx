import { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  UserPlus, Search, Filter, MoreVertical, Trash2, 
  ChevronRight, Users, UserCheck, UserMinus, AlertCircle 
} from 'lucide-react';

export default function Patients() {
  const { profile } = useOutletContext();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', 
    phone_number: '', gender: '', blood_group: '', date_of_birth: '', address: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('patients/');
      setPatients(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchTerm(q);
  }, [location.search]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('onboard/patient/', formData);
      setIsModalOpen(false);
      setFormData({
        username: '', email: '', password: '', first_name: '', last_name: '', 
        phone_number: '', gender: '', blood_group: '', date_of_birth: '', address: ''
      });
      fetchPatients();
    } catch (err) {
      alert('Failed to register patient. Check if username exists.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await api.delete(`patients/${id}/`);
        fetchPatients();
      } catch (err) {
        alert('Failed to delete patient.');
      }
    }
  };

  const filtered = patients.filter(p => 
    (p.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.user?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Patients Directory</h2>
          <p className="text-slate-500 mt-1">Manage and view all registered patients in the system.</p>
        </div>
        {['Admin', 'Staff'].includes(profile.role) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <UserPlus className="w-5 h-5" /> Register Patient
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Recently Added', value: filtered.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Critical Care', value: '12', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex bg-slate-50 rounded-xl px-4 py-2 w-full max-w-md border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
            <input 
              type="text" 
              placeholder="Search by name, ID or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium" 
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-100">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Patient Details</th>
                <th className="px-6 py-4">Contact Information</th>
                <th className="px-6 py-4">Gender / Blood</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(p.user?.first_name || p.user?.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">
                           {p.user?.first_name ? `${p.user.first_name} ${p.user.last_name}` : p.user?.username}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">ID: PT-00{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-600">{p.user?.email || '-'}</p>
                    <p className="text-[11px] text-slate-400">{p.user?.phone_number || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">{p.gender || 'N/A'}</span>
                       <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold">{p.blood_group || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      {profile.role === 'Admin' && (
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No patients found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Register New Patient</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in the details to create a new patient profile.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">&times;</button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Account Details</p>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username *</label>
                    <input required type="text" onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="johndoe" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password *</label>
                    <input required type="password" onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                    <input type="email" onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Personal Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">First Name</label>
                      <input type="text" onChange={e=>setFormData({...formData, first_name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Last Name</label>
                      <input type="text" onChange={e=>setFormData({...formData, last_name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                    <input type="text" onChange={e=>setFormData({...formData, phone_number: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="+1 XXXXXXXX" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                      <select onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Blood Group</label>
                      <select onChange={e=>setFormData({...formData, blood_group: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="">Select</option><option value="A+">A+</option><option value="B+">B+</option><option value="O+">O+</option><option value="AB+">AB+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
