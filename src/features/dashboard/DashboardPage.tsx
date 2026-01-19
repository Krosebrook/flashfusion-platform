import React from 'react';
import { 
  Zap, 
  Globe, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Server,
  Cpu,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="p-6 rounded-2xl bg-card border border-border shadow-sm group hover:border-primary/50 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-3 rounded-xl", color || "bg-primary/10 text-primary")}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
          trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
        )}>
          <TrendingUp size={10} className={trend < 0 ? "rotate-180" : ""} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export const DashboardPage = ({ stats, onRunFullAudit }: { stats: any, onRunFullAudit: () => void }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground">Real-time health status across your deployment ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Deployments" 
          value={stats.total_deployments || 29} 
          icon={Globe} 
          trend={12} 
        />
        <StatCard 
          title="Active Instances" 
          value={stats.active_deployments || 24} 
          icon={CheckCircle2} 
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard 
          title="Critical Alerts" 
          value={stats.alerts || 3} 
          icon={AlertTriangle} 
          color="bg-amber-500/10 text-amber-500"
          trend={-5}
        />
        <StatCard 
          title="Avg Response Time" 
          value="420ms" 
          icon={Zap} 
          color="bg-blue-500/10 text-blue-500"
          trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <BarChart3 size={18} />
              </div>
              <h2 className="font-semibold text-lg">Deployment Performance</h2>
            </div>
            <select className="bg-secondary text-xs font-medium px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-2 px-2">
            {[45, 67, 89, 43, 92, 56, 78, 65, 84, 59, 73, 91].map((val, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-sm" 
                  style={{ height: `${val}%` }} 
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-[10px] font-bold px-1.5 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {val}% Health
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Jan 01</span>
            <span>Jan 03</span>
            <span>Jan 05</span>
            <span>Jan 07</span>
            <span>Jan 09</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="font-semibold text-lg mb-4">Platform Health</h2>
            <div className="space-y-4">
              {[
                { name: 'Vercel', healthy: 7, total: 7, icon: Server },
                { name: 'Base44', healthy: 5, total: 7, icon: Cpu },
                { name: 'Replit', healthy: 4, total: 6, icon: Server },
                { name: 'Lovable', healthy: 2, total: 2, icon: Cpu },
              ].map((platform) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <platform.icon size={14} className="text-muted-foreground" />
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <span className="text-xs font-bold">{platform.healthy}/{platform.total}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        (platform.healthy / platform.total) > 0.8 ? "bg-emerald-500" : "bg-amber-500"
                      )} 
                      style={{ width: `${(platform.healthy / platform.total) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="font-bold text-primary mb-1">AI Audit Ready</h3>
              <p className="text-xs text-primary/80 mb-4">Run an AI-powered health check on all {stats.total_deployments || '40+'} deployments now.</p>
              <button 
                onClick={onRunFullAudit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
              >
                Run Full Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
