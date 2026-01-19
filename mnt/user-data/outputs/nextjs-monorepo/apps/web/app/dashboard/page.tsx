import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUser() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/auth/login');
  }

  return session.user;
}

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Total Generations</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">Active Deployments</div>
            <div className="text-3xl font-bold">0</div>
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground mb-1">This Month</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 bg-primary text-primary-foreground rounded-lg text-left hover:opacity-90 transition-opacity">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-semibold mb-1">Generate New App</div>
              <div className="text-sm opacity-80">Start a new AI-powered generation</div>
            </button>
            
            <button className="p-6 bg-card border rounded-lg text-left hover:bg-accent transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold mb-1">View Analytics</div>
              <div className="text-sm text-muted-foreground">Check your performance metrics</div>
            </button>
            
            <button className="p-6 bg-card border rounded-lg text-left hover:bg-accent transition-colors">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-semibold mb-1">Manage Deployments</div>
              <div className="text-sm text-muted-foreground">View and control your apps</div>
            </button>
            
            <button className="p-6 bg-card border rounded-lg text-left hover:bg-accent transition-colors">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold mb-1">Settings</div>
              <div className="text-sm text-muted-foreground">Configure your account</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start by generating your first app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
