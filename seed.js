"use strict";
/**
 * Seed Script
 * Populates database with sample data for testing and demo purposes
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var adminClient = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
var SAMPLE_USERS = [
    {
        email: 'demo@flashfusion.dev',
        password: 'demo-password-123',
        display_name: 'Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    },
    {
        email: 'sarah@indie.dev',
        password: 'sarah-password-456',
        display_name: 'Sarah Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    {
        email: 'alex@agency.com',
        password: 'alex-password-789',
        display_name: 'Alex Martinez',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    }
];
var SAMPLE_GENERATIONS = [
    {
        app_name: 'TaskMaster Pro',
        platform: 'web',
        framework: 'nextjs',
        config: {
            features: ['auth', 'database', 'realtime'],
            styling: 'tailwind',
            auth: 'supabase',
            database: 'supabase'
        },
        status: 'complete',
        progress: 100,
        download_url: 'https://storage.example.com/taskmaster-pro.zip',
        cost_estimate: { vercel: 20, supabase: 25, total: 45 }
    },
    {
        app_name: 'Fitness Tracker',
        platform: 'mobile',
        framework: 'react-native',
        config: {
            features: ['auth', 'database', 'push-notifications'],
            styling: 'native',
            auth: 'firebase',
            database: 'firebase'
        },
        status: 'complete',
        progress: 100,
        download_url: 'https://storage.example.com/fitness-tracker.zip',
        cost_estimate: { firebase: 30, total: 30 }
    },
    {
        app_name: 'Invoice Generator',
        platform: 'web',
        framework: 'react',
        config: {
            features: ['auth', 'database', 'pdf-export'],
            styling: 'mui',
            auth: 'auth0',
            database: 'postgres'
        },
        status: 'generating',
        progress: 65,
        logs: [
            '[2025-11-22 10:15:30] Starting generation...',
            '[2025-11-22 10:15:45] Scaffold created',
            '[2025-11-22 10:16:20] Installing dependencies...'
        ]
    },
    {
        app_name: 'Chat App',
        platform: 'web',
        framework: 'nextjs',
        config: {
            features: ['auth', 'realtime', 'file-upload'],
            styling: 'shadcn',
            auth: 'supabase',
            database: 'supabase'
        },
        status: 'error',
        progress: 45,
        error_message: 'Build failed: Missing environment variable SUPABASE_URL',
        logs: [
            '[2025-11-22 11:20:10] Starting generation...',
            '[2025-11-22 11:20:25] Scaffold created',
            '[2025-11-22 11:21:05] ERROR: Missing SUPABASE_URL'
        ]
    }
];
var PLATFORMS = ['vercel', 'base44', 'netlify', 'replit'];
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var userIds, _i, SAMPLE_USERS_1, user, _a, data, error, i, gen, userId, _b, generationData, genError, platform, url, deployError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Starting database seeding...\n');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 11, , 12]);
                    // Create sample users
                    console.log('👥 Creating sample users...');
                    userIds = [];
                    _i = 0, SAMPLE_USERS_1 = SAMPLE_USERS;
                    _c.label = 2;
                case 2:
                    if (!(_i < SAMPLE_USERS_1.length)) return [3 /*break*/, 5];
                    user = SAMPLE_USERS_1[_i];
                    return [4 /*yield*/, adminClient.auth.admin.createUser({
                            email: user.email,
                            password: user.password,
                            email_confirm: true,
                            user_metadata: {
                                display_name: user.display_name,
                                avatar_url: user.avatar_url
                            }
                        })];
                case 3:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("   \u274C Failed to create ".concat(user.email, ":"), error.message);
                    }
                    else {
                        userIds.push(data.user.id);
                        console.log("   \u2705 Created ".concat(user.email));
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\n\uD83D\uDCF1 Creating ".concat(SAMPLE_GENERATIONS.length, " sample app generations...\n"));
                    i = 0;
                    _c.label = 6;
                case 6:
                    if (!(i < SAMPLE_GENERATIONS.length)) return [3 /*break*/, 10];
                    gen = SAMPLE_GENERATIONS[i];
                    userId = userIds[i % userIds.length];
                    return [4 /*yield*/, adminClient
                            .from('app_generations')
                            .insert(__assign({ user_id: userId }, gen))
                            .select()
                            .single()];
                case 7:
                    _b = _c.sent(), generationData = _b.data, genError = _b.error;
                    if (genError) {
                        console.error("   \u274C Failed to create \"".concat(gen.app_name, "\":"), genError.message);
                        return [3 /*break*/, 9];
                    }
                    console.log("   \u2705 Created \"".concat(gen.app_name, "\" (").concat(gen.status, ")"));
                    if (!(gen.status === 'complete' && generationData)) return [3 /*break*/, 9];
                    platform = PLATFORMS[i % PLATFORMS.length];
                    url = "https://".concat(gen.app_name.toLowerCase().replace(/\s+/g, '-'), ".").concat(platform, ".app");
                    return [4 /*yield*/, adminClient
                            .from('deployments')
                            .insert({
                            app_generation_id: generationData.id,
                            platform: platform,
                            url: url,
                            status: 'active',
                            last_verified: new Date().toISOString()
                        })];
                case 8:
                    deployError = (_c.sent()).error;
                    if (deployError) {
                        console.error("      \u274C Failed to create deployment:", deployError.message);
                    }
                    else {
                        console.log("      \uD83D\uDCE6 Deployed to ".concat(platform, ": ").concat(url));
                    }
                    _c.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 6];
                case 10:
                    // Print summary
                    console.log('\n═══════════════════════════════════════════════════');
                    console.log('                  SEEDING COMPLETE                  ');
                    console.log('═══════════════════════════════════════════════════\n');
                    console.log('📊 Summary:');
                    console.log("   - ".concat(userIds.length, " users created"));
                    console.log("   - ".concat(SAMPLE_GENERATIONS.length, " app generations created"));
                    console.log("   - ".concat(SAMPLE_GENERATIONS.filter(function (g) { return g.status === 'complete'; }).length, " deployments created"));
                    console.log('\n🔑 Test Credentials:');
                    SAMPLE_USERS.forEach(function (user) {
                        console.log("   - ".concat(user.email, " / ").concat(user.password));
                    });
                    console.log('\n✨ You can now test the application with these accounts!\n');
                    process.exit(0);
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _c.sent();
                    console.error('\n❌ Seeding failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
seed();
