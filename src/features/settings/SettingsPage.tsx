import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Bell, 
  Cloud, 
  Save,
  CheckCircle2,
  Github,
  Monitor
} from 'lucide-react';
import { blink } from '@/lib/blink';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and platform integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User size={18} className="text-primary" />
            Profile
          </h2>
          <p className="text-xs text-muted-foreground">Your personal information and how you appear on the platform.</p>
        </div>

        <div className="md:col-span-2 space-y-6 bg-card border border-border p-8 rounded-3xl shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <span className="text-3xl font-black">{user?.displayName?.[0] || user?.email?.[0] || 'U'}</span>
              </div>
              <div>
                <button className="text-sm font-bold text-primary hover:underline">Change Avatar</button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or SVG. Max size 1MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.displayName}
                  placeholder="Your Name"
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="email" 
                    value={user?.email}
                    disabled
                    className="w-full bg-secondary/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Cloud size={18} className="text-primary" />
            Integrations
          </h2>
          <p className="text-xs text-muted-foreground">Connect your external platforms to enable automated health audits.</p>
        </div>

        <div className="md:col-span-2 space-y-4">
          {[
            { name: 'Vercel', connected: true, icon: Monitor },
            { name: 'Netlify', connected: false, icon: Cloud },
            { name: 'GitHub', connected: true, icon: Github },
            { name: 'Supabase', connected: true, icon: Shield },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border group hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  item.connected ? "bg-primary/5 border-primary/20 text-primary" : "bg-secondary border-border text-muted-foreground"
                )}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {item.connected ? 'Connected and syncing' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                item.connected 
                  ? "bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive" 
                  : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
              )}>
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
          Save Changes
        </button>
      </div>
    </div>
  );
};