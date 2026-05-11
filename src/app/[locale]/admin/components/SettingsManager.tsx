'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Save, Key, ShieldCheck, Wand2 } from 'lucide-react';

export default function SettingsManager() {
  const [pricePassword, setPricePassword] = useState('');
  const [premiumPassword, setPremiumPassword] = useState('');
  const [eurRate, setEurRate] = useState('4.30');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const price = data.find(s => s.id === 'price_password')?.value;
      const premium = data.find(s => s.id === 'premium_password')?.value;
      const rate = data.find(s => s.id === 'eur_rate')?.value;
      if (price) setPricePassword(price);
      if (premium) setPremiumPassword(premium);
      if (rate) setEurRate(rate);
    }
    setLoading(false);
  };

  const handleSave = async (id: string, value: string) => {
    setSaving(true);
    setMessage('');
    
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id, value, updated_at: new Date().toISOString() });

    if (error) {
      alert('Błąd: ' + error.message);
    } else {
      setMessage('Zapisano pomyślnie!');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const recalculateAllPrices = async (rate: number) => {
    const { data: geckos } = await supabase.from('geckos').select('id, price');
    if (!geckos) return;

    await Promise.all(geckos.map(async (g) => {
      if (g.price) {
        const raw = g.price / rate;
        const rounded = Math.ceil(raw / 5) * 5;
        await supabase.from('geckos').update({ priceEur: rounded }).eq('id', g.id);
      }
    }));
  };

  if (loading) return <div className="flex justify-center p-12"><LoaderCircle className="w-8 h-8 animate-spin text-earth-accent" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-earth-dark/10 bg-earth-beige/20">
        <h2 className="text-2xl font-bold text-earth-dark">Ustawienia Systemowe</h2>
        <p className="text-earth-dark/60 text-sm">Zarządzaj hasłami oraz parametrami strony.</p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Price Password */}
          <div className="bg-earth-beige/10 p-6 rounded-2xl border border-earth-dark/20 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-earth-main/10 rounded-lg">
                <Key className="w-5 h-5 text-earth-main" />
              </div>
              <h3 className="font-bold text-earth-dark text-lg">Hasło do cen</h3>
            </div>
            <p className="text-sm text-earth-dark/60">
              Hasło odblokowujące ukryte ceny oraz oferty "Secret".
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={pricePassword} 
                onChange={e => setPricePassword(e.target.value)}
                className="flex-grow border-2 border-earth-dark/10 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors"
                placeholder="Wpisz nowe hasło..."
              />
              <button 
                onClick={() => handleSave('price_password', pricePassword)}
                disabled={saving}
                className="bg-earth-dark hover:bg-earth-main text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center min-w-[50px]"
              >
                {saving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Premium Password */}
          <div className="bg-earth-beige/10 p-6 rounded-2xl border border-earth-dark/20 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-earth-main/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-earth-main" />
              </div>
              <h3 className="font-bold text-earth-dark text-lg">Hasło PREMIUM</h3>
            </div>
            <p className="text-sm text-earth-dark/60">
              Hasło odblokowujące kategorie prywatne oraz oferty premium.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={premiumPassword} 
                onChange={e => setPremiumPassword(e.target.value)}
                className="flex-grow border-2 border-earth-dark/10 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors"
                placeholder="Wpisz nowe hasło..."
              />
              <button 
                onClick={() => handleSave('premium_password', premiumPassword)}
                disabled={saving}
                className="bg-earth-dark hover:bg-earth-main text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center min-w-[50px]"
              >
                {saving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* EUR Rate */}
          <div className="bg-earth-beige/10 p-6 rounded-2xl border border-earth-dark/20 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-earth-main/10 rounded-lg">
                <span className="font-black text-earth-main">€</span>
              </div>
              <h3 className="font-bold text-earth-dark text-lg">Kurs EUR</h3>
            </div>
            <p className="text-sm text-earth-dark/60">
              Domyślny przelicznik z PLN na EUR w panelu edycji.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01"
                  value={eurRate} 
                  onChange={e => setEurRate(e.target.value)}
                  className="flex-grow border-2 border-earth-dark/10 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors"
                  placeholder="np. 4.35"
                />
                <button 
                  onClick={() => handleSave('eur_rate', eurRate)}
                  disabled={saving}
                  className="bg-earth-dark hover:bg-earth-main text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center min-w-[50px]"
                  title="Zapisz kurs"
                >
                  {saving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={async () => {
                  if (confirm('Czy chcesz automatycznie przeliczyć ceny we WSZYSTKICH ofertach?')) {
                    setSaving(true);
                    await recalculateAllPrices(parseFloat(eurRate));
                    setSaving(false);
                    setMessage('Wszystkie ceny zostały przeliczone!');
                    setTimeout(() => setMessage(''), 3000);
                  }
                }}
                disabled={saving}
                className="w-full py-3 bg-earth-accent hover:bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Wand2 className="w-4 h-4" /> Przelicz wszystkie ceny
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold border border-green-200 animate-fade-in">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
