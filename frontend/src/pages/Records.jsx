
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import {
  FilePlus, FileText, AlertCircle, Search,
  Filter, ChevronRight, Activity, ClipboardList,
  Pill, Stethoscope
} from 'lucide-react';

const defaultForm = { patient: '', doctor: '', appointment: '', diagnosis: '', prescription: '', treatment_plan: '' };

export default function Records() {
  const { profile } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const recRes = await api.get('records/');
      setRecords(recRes.data);
      if (['Admin', 'Doctor', 'Staff'].includes(profile.role)) {
        const [docRes, patRes, aptRes] = await Promise.all([
          api.get('doctors/'), api.get('patients/'), api.get('appointments/')
        ]);
        setDoctors(docRes.data);
        setPatients(patRes.data);
        setAppointments(aptRes.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.appointment) delete payload.appointment;
      await api.post('records/', payload);
      setIsModalOpen(false);
      setFormData(defaultForm);
      fetchAll();
    } catch (err) {
      alert('Failed to create record. Please check the inputs.');
    } finally { setLoading(false); }
  };

  const filtered = records.filter(rec => {
    const searchMatch =
      (rec.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.patient_details?.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.patient_details?.user?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.patient_details?.user?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'All') return searchMatch;
    if (filterType === 'Critical') return searchMatch && rec.diagnosis.toLowerCase().includes('critical');
    return searchMatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Medical Records</h2>
          <p className="text-slate-500 mt-1 font-medium">Access and manage comprehensive patient health histories.</p>
        </div>
        {['Admin', 'Doctor'].includes(profile.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <FilePlus className="w-5 h-5" /> New Record
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Records', value: records.length, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Recent Diagnoses', value: records.length > 0 ? '4' : '0', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Prescriptions', value: records.filter(r => r.prescription).length, icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      {/* Search & Filter */}
      <div className="flex bg-white rounded-2xl border border-slate-100 shadow-sm p-2 gap-2">
        <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by diagnosis or patient name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm px-3 py-3 w-full text-slate-700 font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 cursor-pointer"
            >
              <option value="All">All Records</option>
              <option value="Critical">Critical Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-6">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg font-bold">No medical records found.</p>
          </div>
        )}
        {filtered.map(rec => (
          <div key={rec.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{rec.diagnosis}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Recorded on {new Date(rec.date_recorded).toLocaleDateString([], { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Provider</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-700">
                      Dr. {rec.doctor_details?.user?.first_name ? `${rec.doctor_details.user.first_name} ${rec.doctor_details.user.last_name}` : rec.doctor_details?.user?.username}
                    </p>
                    <p className="text-xs text-slate-400 font-medium uppercase mt-0.5">{rec.doctor_details?.specialization}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pt-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Information</span>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-700">
                      {rec.patient_details?.user?.first_name ? `${rec.patient_details.user.first_name} ${rec.patient_details.user.last_name}` : rec.patient_details?.user?.username}
                    </p>
                    <p className="text-xs text-emerald-600/70 font-medium mt-0.5 uppercase tracking-tighter">ID: PT-00{rec.patient_details?.id}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {rec.prescription && (
                    <div className="relative p-6 bg-primary/5 rounded-2xl border border-primary/10 group-hover:bg-primary/[0.07] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Prescription Details</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">{rec.prescription}</p>
                    </div>
                  )}
                  {rec.treatment_plan && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Treatment Plan</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">{rec.treatment_plan}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add Medical Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log new medical findings and treatment details.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Reference Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Patient *</label>
                    <select required onChange={e => setFormData({ ...formData, patient: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.user.username} ({p.user.first_name})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Doctor *</label>
                    <select required onChange={e => setFormData({ ...formData, doctor: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.user.last_name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Related Appointment</label>
                  <select onChange={e => setFormData({ ...formData, appointment: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                    <option value="">No specific appointment</option>
                    {appointments.map(a => <option key={a.id} value={a.id}>#{a.id} — {new Date(a.appointment_datetime).toLocaleDateString()}</option>)}
                  </select>
                </div>

                <p className="text-[10px] font-bold text-primary uppercase tracking-widest pt-2">Clinical Findings</p>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Diagnosis *</label>
                  <input required type="text" onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Chronic Hypertension" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Prescription</label>
                  <textarea rows="3" onChange={e => setFormData({ ...formData, prescription: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="List medications, dosage and frequency..."></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Treatment Plan</label>
                  <textarea rows="3" onChange={e => setFormData({ ...formData, treatment_plan: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl mt-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Notes on follow-up, diet, exercise..."></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
