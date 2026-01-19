"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
var ssr_1 = require("@supabase/ssr");
var headers_1 = require("next/headers");
var navigation_1 = require("next/navigation");
function getUser() {
    return __awaiter(this, void 0, void 0, function () {
        var cookieStore, supabase, _a, session, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, headers_1.cookies)()];
                case 1:
                    cookieStore = _b.sent();
                    supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        cookies: {
                            get: function (name) {
                                var _a;
                                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                            },
                        },
                    });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _a = _b.sent(), session = _a.data.session, error = _a.error;
                    if (error || !session) {
                        (0, navigation_1.redirect)('/auth/login');
                    }
                    return [2 /*return*/, session.user];
            }
        });
    });
}
function DashboardPage() {
    return __awaiter(this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUser()];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, (<div className="min-h-screen p-8">
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
    </div>)];
            }
        });
    });
}
