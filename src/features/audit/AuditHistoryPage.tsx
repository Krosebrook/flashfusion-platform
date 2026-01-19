import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { blink } from '@/lib/blink';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const AuditHistoryPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await (blink.db as any).auditResults.list({
        orderBy: { testedAt: 'desc' },
        limit: 100
      });
      setResults(data);
    } catch (error) {
      console.error('Error fetching audit history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.error?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Audit History</h1>
        <p className="text-muted-foreground">Historical records of all deployment health checks.</p>
      </div>

      <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search history..." 
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Response Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">SSL</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tested At</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-secondary rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredResults.map((result) => (
                <tr key={result.id} className="group hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {result.status === 'active' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <AlertCircle size={14} className="text-destructive" />
                      )}
                      <span className="text-xs font-medium capitalize">{result.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono">{result.responseTime}ms</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      Number(result.sslValid) > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    )}>
                      {Number(result.sslValid) > 0 ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {format(new Date(result.testedAt), 'MMM d, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={result.error || result.recommendation}>
                      {result.error || result.recommendation || '-'}
                    </p>
                  </td>
                </tr>
              ))}
              {!loading && filteredResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
