import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, User, Mail, Phone, MapPin, Check } from 'lucide-react';

interface AuthModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onLogin: (u: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ user, onClose, onLogin, onLogout }) => {
  const [name, setName] = useState('Rajesh Sharma');
  const [email, setEmail] = useState('rajesh.sharma@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [state, setState] = useState('Karnataka');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      state,
      savedTreesCount: 2,
      completedDocsCount: 1,
      upcomingAppointments: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md shadow-indigo-500/20">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-xs text-slate-400">{user.email}</p>
                <span className="text-[10px] text-emerald-400 font-mono">{user.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 my-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saved Family Trees</span>
                <p className="text-lg font-bold text-indigo-400 mt-0.5">{user.savedTreesCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Completed Reports</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">{user.completedDocsCount}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold font-sans text-white">ADHIKAR Account Profile</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Save family trees, legal draft reports, and sync across devices.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">State / Jurisdiction</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/20"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Sign In & Save Session</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
