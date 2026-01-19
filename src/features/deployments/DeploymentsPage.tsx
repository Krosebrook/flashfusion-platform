import React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  RefreshCcw, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blink } from '@/lib/blink';
import { toast } from 'react-hot-toast';

const PlatformBadge = ({ platform }: { platform: string }) => {
  const colors: Record<string, string> = {
    vercel: "bg-black text-white border-white/20",
    base44: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    replit: "bg-red-500/10 text-red-500 border-red-500/20",
    netlify: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    lovable: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    blink: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      colors[platform.toLowerCase()] || "bg-secondary text-muted-foreground border-border"
    )}>
      {platform}
    </span>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const configs: Record<string, any> = {
    active: { icon: CheckCircle2, color: "text-emerald-500", label: "Healthy" },
    deprecated: { icon: Trash2, color: "text-destructive", label: "Deprecated" },
    stale: { icon: Clock, color: "text-amber-500", label: "Stale" },
    dead: { icon: AlertCircle, color: "text-destructive", label: "Down" },
  };

  const config = configs[status.toLowerCase()] || configs.stale;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={config.color} />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

const AddDeploymentDialog = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    url: '',
    platform: 'vercel',
    purpose: 'production'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) throw new Error('Not authenticated');

      await (blink.db as any).deployments.create({
        ...formData,
        userId: user.id,
        status: 'active'
      });
      toast.success('Deployment added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to add deployment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Add Deployment</h2>
          <p className="text-sm text-muted-foreground">Register a new endpoint for health monitoring.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">App Name</label>
            <input 
              required
              type="text" 
              placeholder="My Awesome App"
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Endpoint URL</label>
            <input 
              required
              type="url" 
              placeholder="https://myapp.vercel.app"
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</label>
              <select 
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
                <option value="base44">Base44</option>
                <option value="replit">Replit</option>
                <option value="blink">Blink</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose</label>
              <select 
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Deployment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const DeploymentsPage = ({ deployments, onRefresh }: { deployments: any[], onRefresh: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deployment?')) return;
    try {
      await (blink.db as any).deployments.delete(id);
      toast.success('Deployment removed');
      window.location.reload(); // Simple way to refresh for now
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredDeployments = deployments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground">Manage and monitor all active deployment endpoints.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Deployment
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all">
            <RefreshCcw size={16} />
            Sync Platforms
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search deployments by name, platform, or URL..." 
            className="w-full bg-secondary/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all">
          <Filter size={16} />
          Filters
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                    Deployment Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDeployments.map((deployment) => (
                <tr key={deployment.id} className="group hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{deployment.name}</span>
                      <a 
                        href={deployment.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mt-0.5"
                      >
                        {deployment.url.replace('https://', '')}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PlatformBadge platform={deployment.platform} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusIndicator status={deployment.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-0.5 rounded border border-border">
                      {deployment.purpose}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onRefresh(deployment.id)}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                        title="Quick Audit"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(deployment.id)}
                        className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeployments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No deployments found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-secondary/10">
          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredDeployments.length} of {deployments.length} deployments
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-secondary border border-border rounded-lg text-xs font-medium disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-secondary border border-border rounded-lg text-xs font-medium">Next</button>
          </div>
        </div>
      </div>
      <AddDeploymentDialog 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
};
