import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Activity } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('users/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-10 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 relative z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to the HMS Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
              placeholder="Enter your username"
              required 
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-2.5 mt-2 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account? <a href="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
