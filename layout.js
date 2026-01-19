"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
var google_1 = require("next/font/google");
require("./globals.css");
var inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: {
        default: 'FlashFusion - AI-Powered App Generation',
        template: '%s | FlashFusion',
    },
    description: 'Generate and deploy AI-powered applications in minutes with FlashFusion\'s multi-channel publishing platform.',
    keywords: ['AI', 'app generation', 'no-code', 'POD', 'multi-channel publishing'],
    authors: [{ name: 'FlashFusion Team' }],
    creator: 'FlashFusion',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_APP_URL,
        title: 'FlashFusion - AI-Powered App Generation',
        description: 'Generate and deploy AI-powered applications in minutes.',
        siteName: 'FlashFusion',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FlashFusion - AI-Powered App Generation',
        description: 'Generate and deploy AI-powered applications in minutes.',
        creator: '@flashfusion',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Providers would go here (Theme, Auth, etc.) */}
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>);
}
