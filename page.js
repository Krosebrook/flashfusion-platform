"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
var link_1 = __importDefault(require("next/link"));
function HomePage() {
    return (<div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        {/* Hero Section */}
        <h1 className="text-6xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FlashFusion
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate and deploy AI-powered applications in minutes with our multi-channel publishing platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center pt-8">
          <link_1.default href="/auth/signup" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Started
          </link_1.default>
          <link_1.default href="/dashboard" className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            Dashboard
          </link_1.default>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Generate apps in seconds with AI-powered workflows
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl">🚀</div>
            <h3 className="font-semibold">Multi-Channel Deploy</h3>
            <p className="text-sm text-muted-foreground">
              Publish to Vercel, Netlify, Shopify, and more
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl">🔒</div>
            <h3 className="font-semibold">Secure & Scalable</h3>
            <p className="text-sm text-muted-foreground">
              Built with Supabase RLS and production-grade security
            </p>
          </div>
        </div>

        {/* Tech Stack Badge */}
        <div className="pt-16">
          <p className="text-sm text-muted-foreground mb-4">Powered by</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {['Next.js 14', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'].map(function (tech) { return (<span key={tech} className="px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                {tech}
              </span>); })}
          </div>
        </div>
      </div>
    </div>);
}
