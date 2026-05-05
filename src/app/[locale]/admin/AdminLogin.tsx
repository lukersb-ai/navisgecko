'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/adminAuth';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Najpierw logowanie z Supabase (ustawia bezpieczną sesję na urządzeniu klienta do operacji RLS)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Nieprawidłowy email lub hasło' : authError.message);
      setLoading(false);
      return;
    }

    // Następnie ustawiamy ciasteczko Next.js aby odblokować renderowanie dashboardu po stronie serwera
    const res = await loginAction();
    
    if (res.success) {
      router.refresh();
    } else {
      setError('Błąd ustawiania sesji przeglądarki.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-earth-dark/5">
        <div className="text-center mb-8">
           <div className="mx-auto w-16 h-16 bg-earth-beige/30 rounded-full flex items-center justify-center mb-4">
             <Lock className="w-8 h-8 text-earth-accent" />
           </div>
           <h1 className="text-3xl font-bold text-earth-dark">Bezpieczny Panel Autora</h1>
           <p className="text-earth-dark/60 mt-2">Logowanie zweryfikowane przez Supabase Auth.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-earth-dark mb-2">Adres Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-earth-beige/10 border border-earth-beige/30 rounded-xl focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all text-earth-dark outline-none"
              placeholder="Twój email..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-dark mb-2">Hasło dostępne</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-earth-beige/10 border border-earth-beige/30 rounded-xl focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all text-earth-dark outline-none"
              placeholder="Wprowadź hasło..."
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm py-2 text-center bg-red-50 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-earth-accent hover:bg-earth-dark text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-accent flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}
