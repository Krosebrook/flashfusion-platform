import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Activity, 
  History, 
  Settings, 
  LogOut,
  ChevronRight,
  Zap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blink } from '@/lib/blink';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "text-primary")} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge ? (
      <span className={cn(
        "px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
        active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
      )}>
        {badge}
      </span>
    ) : (
      active && <ChevronRight size={14} className="opacity-50" />
    )}
  </button>
);

export const AppLayout = ({ children, activePage, setActivePage }: { children: React.ReactNode, activePage: string, setActivePage: (page: string) => void }) => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    return blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
    });
  }, []);

  const handleLogout = async () => {
    await blink.auth.signOut();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 animate-float">
              <Zap className="text-primary-foreground" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">FlashFusion</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Platform v2.0</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activePage === 'dashboard'} 
              onClick={() => setActivePage('dashboard')} 
            />
            <SidebarItem 
              icon={Globe} 
              label="Deployments" 
              active={activePage === 'deployments'} 
              onClick={() => setActivePage('deployments')} 
              badge="40+"
            />
            <SidebarItem 
              icon={Activity} 
              label="Health Audit" 
              active={activePage === 'audit'} 
              onClick={() => setActivePage('audit')} 
            />
            <SidebarItem 
              icon={History} 
              label="History" 
              active={activePage === 'history'} 
              onClick={() => setActivePage('history')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-4 space-y-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Health Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">System Operational</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={activePage === 'settings'} 
              onClick={() => setActivePage('settings')} 
            />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-texture pointer-events-none" />
        
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground capitalize">{activePage}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{user?.displayName?.[0] || 'U'}</span>
              </div>
              <span className="text-xs font-medium">{user?.displayName || user?.email || 'User'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
};
