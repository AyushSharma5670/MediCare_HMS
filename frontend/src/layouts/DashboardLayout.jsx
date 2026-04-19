import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/shared/Sidebar';
import Header from '../components/shared/Header';

export default function DashboardLayout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('users/profile/');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('access_token')) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar role={profile.role} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header profile={profile} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ profile }} />
          </div>
        </main>
      </div>
    </div>
  );
}
