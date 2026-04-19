import { useOutletContext } from 'react-router-dom';
import { User, Lock, Bell, Shield, Palette, Globe, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

export default function Settings() {
  const { profile } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile tab state
  const [profileForm, setProfileForm] = useState({
    email: profile.email || '',
    phone_number: profile.phone_number || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security tab state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    try {
      await api.patch('users/profile/', profileForm);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg('Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      await api.post('users/change-password/', {
        old_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg('Password updated successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwError(err?.error || 'Failed to update password. Check your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Personal info and contact details' },
    { id: 'security', label: 'Security', icon: Lock, desc: 'Password and authentication' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email and system alerts' },
    { id: 'display', label: 'Display', icon: Palette, desc: 'Theme and layout preferences' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-slate-500 mt-1 font-medium">Manage your account preferences and system configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-1.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-slate-100'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{tab.label}</p>
                  <p className={`text-[10px] truncate ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>{tab.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-0' : 'translate-x-0 opacity-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="text-xl font-bold text-slate-800">Profile Information</h3>
                 <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Update your personal account details</p>
              </div>
              
              <form onSubmit={handleProfileSave} className="p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-2 border-white shadow-md">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary shadow-sm transition-all">
                       <User className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-none">{profile.username}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-widest">{profile.role}</p>
                    <div className="mt-3 flex gap-2">
                       <button type="button" className="text-xs font-bold text-primary hover:underline">Change Avatar</button>
                       <button type="button" className="text-xs font-bold text-red-400 hover:underline ml-2">Remove</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/30"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/30"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider opacity-60">Username (Non-editable)</label>
                    <input
                      type="text"
                      value={profile.username}
                      className="w-full border border-slate-100 p-3.5 rounded-xl text-sm outline-none bg-slate-100/50 text-slate-400 cursor-not-allowed font-medium"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/30"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone_number}
                      onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                      className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-700 bg-slate-50/30"
                      placeholder="+1 XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider opacity-60">User Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      className="w-full border border-slate-100 p-3.5 rounded-xl text-sm outline-none bg-slate-100/50 text-slate-400 cursor-not-allowed font-medium"
                      readOnly
                    />
                  </div>
                </div>

                {profileMsg && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${profileMsg.includes('success') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${profileMsg.includes('success') ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {profileMsg}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-4 border-t border-slate-50 mt-4">
                  <button type="button" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Discard</button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
                  >
                    {profileLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="animate-in slide-in-from-right-2 duration-300">
               <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="text-xl font-bold text-slate-800">Security & Password</h3>
                 <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Secure your account with a strong password</p>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-8 space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={pwForm.current_password}
                      onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                      className="w-full border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">New Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={pwForm.new_password}
                      onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                      className="w-full border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={pwForm.confirm_password}
                      onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                      className="w-full border border-slate-200 pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {pwError && <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600">{pwError}</div>}
                {pwMsg && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-bold text-emerald-600">{pwMsg}</div>}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {pwLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Update Security Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="animate-in slide-in-from-right-2 duration-300">
               <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
                 <h3 className="text-xl font-bold text-slate-800">Notification Preferences</h3>
                 <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Manage how you receive alerts and updates</p>
              </div>
              
              <div className="p-8 space-y-2">
                {[
                  { label: 'Appointment Reminders', desc: 'Get notified via email 24h before upcoming appointments', defaultOn: true, icon: Calendar },
                  { label: 'System Announcements', desc: 'Stay informed about new features and maintenance', defaultOn: true, icon: Globe },
                  { label: 'Critical Patient Alerts', desc: 'Instant desktop notifications for critical record updates', defaultOn: false, icon: AlertCircle },
                  { label: 'Marketing Communications', desc: 'Receive newsletters and health tips weekly', defaultOn: false, icon: Bell },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-4 -mx-4 rounded-2xl transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 scale-110">
                      <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display Tab (Placeholder) */}
          {activeTab === 'display' && (
             <div className="p-20 text-center animate-in slide-in-from-right-2 duration-300">
                <Palette className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                <h3 className="text-xl font-bold text-slate-800">Appearance Settings</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto">Theme customization and layout preferences will be available in the next version.</p>
                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                   <div className="aspect-video rounded-2xl bg-slate-100 border-2 border-primary p-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/20 mb-2"></div>
                      <p className="text-xs font-bold text-primary">Light Mode</p>
                      <p className="text-[10px] text-slate-400">Default theme</p>
                   </div>
                   <div className="aspect-video rounded-2xl bg-slate-900 p-4 text-left opacity-50 grayscale">
                      <div className="w-8 h-8 rounded-full bg-slate-800 mb-2"></div>
                      <p className="text-xs font-bold text-white">Dark Mode</p>
                      <p className="text-[10px] text-slate-500">Coming soon</p>
                   </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
