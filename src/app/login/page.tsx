'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [pass, setPass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sets the cookie and refreshes to trigger the middleware check
    document.cookie = `site_auth=${pass}; path=/; max-age=86400; SameSite=Lax`; 
    window.location.href = '/'; 
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8 border border-zinc-800 bg-zinc-950 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tighter">Writeup Weaver</h1>
          <p className="text-zinc-500 text-sm">Enter password to access the AI</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="••••••••" 
            autoFocus
            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center text-lg"
            onChange={(e) => setPass(e.target.value)}
          />
          <button 
            type="submit" 
            className="w-full p-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Unlock System
          </button>
        </form>
      </div>
    </div>
  );
}
