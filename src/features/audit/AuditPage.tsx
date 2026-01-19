import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Search, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  History,
  Download
} from 'lucide-react';
import { blink } from '@/lib/blink';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export const AuditPage = ({ deployments }: { deployments: any[] }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await (blink.db as any).auditReports.list({
        orderBy: { createdAt: 'desc' }
      });
      setReports(data);
    } catch (error) {
      console.error('Error fetching audit reports:', error);
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    const loadingToast = toast.loading('AI is analyzing deployment health...');
    
    try {
      const user = await blink.auth.me();
      if (!user) throw new Error('Not authenticated');

      const prompt = `
        Analyze the following deployment data and provide a health report with recommendations.
        Deployments: ${JSON.stringify(deployments.map(d => ({ name: d.name, url: d.url, platform: d.platform, purpose: d.purpose, notes: d.notes, status: d.status })))}
        
        Provide the output in the following JSON format:
        {
          "summary": "overall summary string",
          "healthScore": 0-100,
          "recommendations": [
            { "deploymentName": "name", "action": "KEEP|MIGRATE|DEPRECATE", "reason": "reason" }
          ],
          "risks": ["risk 1", "risk 2"]
        }
      `;

      const response = await blink.ai.generateObject({
        prompt,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            healthScore: { type: "number" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  deploymentName: { type: "string" },
                  action: { type: "string" },
                  reason: { type: "string" }
                },
                required: ["deploymentName", "action", "reason"]
              }
            },
            risks: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "healthScore", "recommendations", "risks"]
        }
      });

      const newReport = response.object;
      
      // Persist report
      await (blink.db as any).auditReports.create({
        userId: user.id,
        summary: newReport.summary,
        healthScore: newReport.healthScore,
        recommendations: JSON.stringify(newReport.recommendations),
        risks: JSON.stringify(newReport.risks),
        createdAt: new Date().toISOString()
      });

      setReport(newReport);
      toast.success('Analysis complete!', { id: loadingToast });
      fetchReports();
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast.error('AI Analysis failed', { id: loadingToast });
    } finally {
      setAnalyzing(false);
    }
  };

  if (showHistory) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Audit Report History</h1>
            <p className="text-muted-foreground">Previously generated AI health reports.</p>
          </div>
          <button 
            onClick={() => setShowHistory(false)}
            className="px-4 py-2 bg-secondary border border-border rounded-xl text-sm font-bold hover:bg-secondary/80 transition-all"
          >
            Back to Audit
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reports.map((r) => (
            <div 
              key={r.id} 
              onClick={() => {
                setReport({
                  ...r,
                  recommendations: JSON.parse(r.recommendations),
                  risks: JSON.parse(r.risks)
                });
                setShowHistory(false);
              }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">Report #{r.id.slice(-4)}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="text-lg font-black text-emerald-500">{r.healthScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.summary}</p>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No reports found.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">AI Health Audit</h1>
          <p className="text-muted-foreground">Deep analysis of your ecosystem using FlashFusion AI.</p>
        </div>
        <button 
          onClick={runAIAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {analyzing ? <Sparkles className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
          {analyzing ? 'Analyzing...' : 'Generate AI Report'}
        </button>
      </div>

      {!report && !analyzing && (
        <div className="p-12 rounded-3xl bg-card border border-dashed border-border flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/50">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-bold">Ready to Scan</h2>
            <p className="text-muted-foreground">Click the button above to start an AI-powered audit. We'll analyze health patterns, identify risks, and suggest cost-saving deprecations.</p>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-secondary/30 border border-border animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="text-primary animate-bounce" size={32} />
              <p className="text-sm font-bold text-primary tracking-widest uppercase">Processing Ecosystem Data...</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-32 rounded-2xl bg-secondary/30 border border-border animate-pulse" />
            <div className="h-32 rounded-2xl bg-secondary/30 border border-border animate-pulse" />
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Executive Summary</h2>
                  <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed">{report.summary}</p>
              <div className="flex items-center gap-6 pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ecosystem Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-emerald-500">{report.healthScore}%</span>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${report.healthScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-secondary/50 border border-border space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Risk Assessment
              </h3>
              <ul className="space-y-4">
                {report.risks.map((risk: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span className="text-muted-foreground font-medium">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold px-2">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.map((rec: any, i: number) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold group-hover:text-primary transition-colors">{rec.deploymentName}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest",
                      rec.action === 'KEEP' ? "bg-emerald-500/10 text-emerald-500" :
                      rec.action === 'MIGRATE' ? "bg-amber-500/10 text-amber-500" :
                      "bg-destructive/10 text-destructive"
                    )}>
                      {rec.action}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-8">
            <button className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-2xl text-sm font-bold hover:bg-secondary/80 transition-all">
              <Download size={18} />
              Export PDF
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-2xl text-sm font-bold hover:bg-secondary/80 transition-all"
            >
              <History size={18} />
              Audit History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
