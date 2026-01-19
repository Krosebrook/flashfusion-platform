import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { DeploymentsPage } from './features/deployments/DeploymentsPage';
import { AuditPage } from './features/audit/AuditPage';
import { AuditHistoryPage } from './features/audit/AuditHistoryPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { blink } from './lib/blink';
import { toast } from 'react-hot-toast';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      if (state.user) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchData = async () => {
    try {
      const deps = await (blink.db as any).deployments.list();
      setDeployments(deps);
      
      // Calculate basic stats
      const activeCount = deps.filter((d: any) => d.status === 'active').length;
      setStats({
        total_deployments: deps.length,
        active_deployments: activeCount,
        alerts: deps.filter((d: any) => d.status === 'dead' || d.status === 'stale').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (id: string) => {
    const deployment = deployments.find(d => d.id === id);
    if (!deployment || !user) return;

    const loadingToast = toast.loading(`Auditing ${deployment.name}...`);
    try {
      const response = await fetch('https://ugj6va4a--health-audit.functions.blink.new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: deployment.url })
      });
      
      const result = await response.json();
      
      let newStatus = 'active';
      if (result.status === 0 || result.status >= 400 || result.error) newStatus = 'dead';
      else if (result.responseTime > 3000) newStatus = 'stale';

      const testedAt = new Date().toISOString();

      // Update deployment status
      await (blink.db as any).deployments.update(id, { 
        status: newStatus,
        lastVerified: testedAt
      });

      // Log audit result
      await (blink.db as any).auditResults.create({
        userId: user.id,
        deploymentId: id,
        status: newStatus,
        httpStatus: result.status || 0,
        responseTime: result.responseTime || 0,
        sslValid: result.sslValid ? "1" : "0",
        error: result.error || null,
        recommendation: newStatus === 'dead' ? 'Check server logs and DNS configuration.' : 
                        newStatus === 'stale' ? 'Consider migrating to a higher performance region.' : 
                        'Deployment is healthy.',
        testedAt
      });

      // Update local state
      setDeployments(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, lastVerified: testedAt } : d));
      
      toast.success(`${deployment.name} is ${newStatus}`, { id: loadingToast });
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Audit failed:', error);
      toast.error('Audit failed', { id: loadingToast });
    }
  };

  const handleFullAudit = async () => {
    if (!user || deployments.length === 0) return;
    
    const loadingToast = toast.loading(`Initiating full audit for ${deployments.length} deployments...`);
    
    try {
      // Process in batches or sequential for simplicity/stability in a demo
      for (const dep of deployments) {
        await handleRefresh(dep.id);
      }
      toast.success('Full ecosystem audit complete!', { id: loadingToast });
    } catch (error) {
      toast.error('Full audit encountered issues', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing FlashFusion Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-texture opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border shadow-2xl relative z-10 text-center space-y-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mx-auto animate-float">
            <svg className="w-10 h-10 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight italic">FLASHFUSION</h1>
            <p className="text-muted-foreground">The ultimate deployment health & AI audit platform.</p>
          </div>
          <button 
            onClick={() => blink.auth.login()}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            Enter Platform
          </button>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Secure Access • Enterprise Grade • AI Powered</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'dashboard' && <DashboardPage stats={stats} onRunFullAudit={handleFullAudit} />}
      {activePage === 'deployments' && <DeploymentsPage deployments={deployments} onRefresh={handleRefresh} />}
      {activePage === 'audit' && <AuditPage deployments={deployments} />}
      {activePage === 'history' && <AuditHistoryPage />}
      {activePage === 'settings' && <SettingsPage />}
    </AppLayout>
  );
}

export default App;