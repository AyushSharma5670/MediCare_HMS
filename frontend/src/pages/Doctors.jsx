import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { 
  UserPlus, Stethoscope, Search, Trash2, 
  ChevronRight, Filter, Award, Clock, Star 
} from 'lucide-react';

const SPECIALIZATIONS = ['Cardiologist','Neurologist','Orthopedic','Pediatrician','Dermatologist','General Practitioner','Oncologist','Psychiatrist','Radiologist','ENT Specialist'];

const defaultForm = {
  username: '', email: '', password: '', first_name: '', last_name: '',
  phone_number: '', specialization: '', license_number: '', experience_years: 0,
};

export default function Doctors() {
  const { profile } = useOutletContext();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('doctors/');
      setDoctors(res.data);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleOnboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('onboard/doctor/', formData);
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchDoctors();
    } catch (err) {
      setError(err?.error || 'Failed to onboard doctor. Check username/license uniqueness.');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor profile?')) {
      try {
        await api.delete(`doctors/${id}/`);
        fetchDoctors();
      } catch (err) {
        alert('Failed to delete doctor.');
      }
    }
  };

  const filtered = doctors.filter(doc =>
    (doc.user?.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.user?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.user?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (doc.specialization || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Medical Staff</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage hospital doctors and their professional profiles.</p>
        </div>
        {profile.role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <UserPlus className="w-5 h-5" /> Onboard Doctor
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Doctors', value: doctors.length, icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Surgeons', value: '8', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'On Duty', value: '14', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Rating', value: '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
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

      {/* Search & Toolbar */}
      <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-2 gap-2">
        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, or license..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm px-3 py-3 w-full text-slate-700 font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20 shadow-inner">
                  {(doc.user?.first_name || doc.user?.username || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">
                    Dr. {doc.user?.first_name && doc.user?.last_name
                      ? `${doc.user.first_name} ${doc.user.last_name}`
                      : doc.user?.username}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{doc.specialization}</span>
                  </div>
                </div>
              </div>
              {profile.role === 'Admin' && (
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-3 pt-5 border-t border-slate-50">
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Experience</span>
                 <span className="font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg">{doc.experience_years} Years</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">License No.</span>
                 <span className="font-bold text-slate-700">{doc.license_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-400 text-xs uppercase tracking-wider">Availability</span>
                 <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Online
                 </span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedDoctor(doc)}
              className="w-full mt-6 py-3 bg-slate-50 rounded-xl text-slate-600 font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
            >
              View Full Profile <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-slate-400">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-bold">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Onboard New Doctor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a new medical professional to the hospital staff.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setError(''); }} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">&times;</button>
            </div>
            <form onSubmit={handleOnboard} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {error && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">{error}</div>}
              
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Personal Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">First Name</label><input type="text" onChange={e=>setFormData({...formData, first_name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Dr. John" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Last Name</label><input type="text" onChange={e=>setFormData({...formData, last_name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Username *</label><input required type="text" onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="johndoe_md" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label><input type="email" onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="doctor@hospital.com" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Password *</label><input required type="password" onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" /></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label><input type="text" onChange={e=>setFormData({...formData, phone_number: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="+1 XXXX" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest pt-2">Professional Profile</p>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Specialization *</label>
                  <select required onChange={e=>setFormData({...formData, specialization: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                    <option value="">Select Field</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">License No. *</label><input required type="text" onChange={e=>setFormData({...formData, license_number: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="MED-XXXXXX" /></div>
                  <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Exp. (Years)</label><input type="number" min="0" defaultValue={0} onChange={e=>setFormData({...formData, experience_years: parseInt(e.target.value) || 0})} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" /></div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setError(''); }} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-3">
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? 'Onboarding...' : 'Onboard Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Doctor Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Professional Credentials</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-2 border-white shadow-md">
                    {selectedDoctor.user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xl leading-none">
                      Dr. {selectedDoctor.user?.first_name} {selectedDoctor.user?.last_name}
                    </h4>
                    <p className="text-xs text-primary font-bold mt-2 bg-primary/10 px-2 py-1 rounded-lg inline-block">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-2 mt-3">
                       <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                       <span className="text-xs font-bold text-slate-700">4.8 (120+ Reviews)</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License Number</p>
                     <p className="font-bold text-slate-700">{selectedDoctor.license_number}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                     <p className="font-bold text-slate-700">{selectedDoctor.experience_years} Years</p>
                  </div>
               </div>

               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Bio</p>
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                     <p className="text-sm text-slate-600 leading-relaxed font-medium">
                       Dr. {selectedDoctor.user?.last_name} is a highly skilled {selectedDoctor.specialization} with over {selectedDoctor.experience_years} years of dedicated service in medical excellence. Known for a patient-centric approach and commitment to clinical precision.
                     </p>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Close Profile
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
