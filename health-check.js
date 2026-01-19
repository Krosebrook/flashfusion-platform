"use strict";
/**
 * Health Check Script
 * Verifies Supabase connection and basic configuration
 */
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
var checks = [];
function runHealthCheck() {
    return __awaiter(this, void 0, void 0, function () {
        var requiredEnvVars, missingVars, supabaseUrl, anonKey, serviceKey, anonClient, adminClient, _a, data, error, error_1, requiredTables, tableChecks, missingTables, rlsData, _b, _c, users, error, error_2, stats, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('🏥 Running Supabase Health Check...\n');
                    requiredEnvVars = [
                        'NEXT_PUBLIC_SUPABASE_URL',
                        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                        'SUPABASE_SERVICE_ROLE_KEY'
                    ];
                    missingVars = requiredEnvVars.filter(function (v) { return !process.env[v]; });
                    if (missingVars.length === 0) {
                        checks.push({
                            name: 'Environment Variables',
                            status: 'pass',
                            message: 'All required environment variables are set'
                        });
                    }
                    else {
                        checks.push({
                            name: 'Environment Variables',
                            status: 'fail',
                            message: "Missing: ".concat(missingVars.join(', ')),
                            details: { missing: missingVars }
                        });
                    }
                    if (missingVars.length > 0) {
                        printResults();
                        return [2 /*return*/];
                    }
                    supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                    serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                    anonClient = (0, supabase_js_1.createClient)(supabaseUrl, anonKey);
                    adminClient = (0, supabase_js_1.createClient)(supabaseUrl, serviceKey);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, adminClient.from('user_profiles').select('count').limit(1)];
                case 2:
                    _a = _e.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        checks.push({
                            name: 'Database Connection',
                            status: 'fail',
                            message: error.message,
                            details: { error: error.code }
                        });
                    }
                    else {
                        checks.push({
                            name: 'Database Connection',
                            status: 'pass',
                            message: 'Successfully connected to Supabase'
                        });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _e.sent();
                    checks.push({
                        name: 'Database Connection',
                        status: 'fail',
                        message: error_1 instanceof Error ? error_1.message : 'Unknown error'
                    });
                    return [3 /*break*/, 4];
                case 4:
                    requiredTables = ['user_profiles', 'app_generations', 'deployments'];
                    return [4 /*yield*/, Promise.all(requiredTables.map(function (table) { return __awaiter(_this, void 0, void 0, function () {
                            var error, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, adminClient.from(table).select('id').limit(1)];
                                    case 1:
                                        error = (_b.sent()).error;
                                        return [2 /*return*/, { table: table, exists: !error }];
                                    case 2:
                                        _a = _b.sent();
                                        return [2 /*return*/, { table: table, exists: false }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    tableChecks = _e.sent();
                    missingTables = tableChecks.filter(function (t) { return !t.exists; }).map(function (t) { return t.table; });
                    if (missingTables.length === 0) {
                        checks.push({
                            name: 'Database Schema',
                            status: 'pass',
                            message: 'All required tables exist'
                        });
                    }
                    else {
                        checks.push({
                            name: 'Database Schema',
                            status: 'fail',
                            message: "Missing tables: ".concat(missingTables.join(', ')),
                            details: { missing: missingTables }
                        });
                    }
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, adminClient.rpc('pg_catalog.pg_tables')];
                case 7:
                    rlsData = (_e.sent()).data;
                    checks.push({
                        name: 'Row Level Security',
                        status: 'warn',
                        message: 'RLS status needs manual verification',
                        details: { note: 'Run npm run verify-rls for detailed RLS testing' }
                    });
                    return [3 /*break*/, 9];
                case 8:
                    _b = _e.sent();
                    checks.push({
                        name: 'Row Level Security',
                        status: 'warn',
                        message: 'Could not verify RLS automatically'
                    });
                    return [3 /*break*/, 9];
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, adminClient.auth.admin.listUsers({
                            page: 1,
                            perPage: 1
                        })];
                case 10:
                    _c = _e.sent(), users = _c.data.users, error = _c.error;
                    if (error) {
                        checks.push({
                            name: 'Authentication Service',
                            status: 'fail',
                            message: error.message
                        });
                    }
                    else {
                        checks.push({
                            name: 'Authentication Service',
                            status: 'pass',
                            message: 'Auth service is operational',
                            details: { userCount: (users === null || users === void 0 ? void 0 : users.length) || 0 }
                        });
                    }
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _e.sent();
                    checks.push({
                        name: 'Authentication Service',
                        status: 'fail',
                        message: error_2 instanceof Error ? error_2.message : 'Unknown error'
                    });
                    return [3 /*break*/, 12];
                case 12:
                    _e.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, adminClient
                            .from('app_generations')
                            .select('status', { count: 'exact' })];
                case 13:
                    stats = (_e.sent()).data;
                    checks.push({
                        name: 'Database Usage',
                        status: 'pass',
                        message: 'Database statistics available',
                        details: {
                            totalGenerations: (stats === null || stats === void 0 ? void 0 : stats.length) || 0
                        }
                    });
                    return [3 /*break*/, 15];
                case 14:
                    _d = _e.sent();
                    checks.push({
                        name: 'Database Usage',
                        status: 'warn',
                        message: 'Could not fetch usage statistics'
                    });
                    return [3 /*break*/, 15];
                case 15:
                    printResults();
                    return [2 /*return*/];
            }
        });
    });
}
function printResults() {
    console.log('═══════════════════════════════════════════════════');
    console.log('              HEALTH CHECK RESULTS                  ');
    console.log('═══════════════════════════════════════════════════\n');
    checks.forEach(function (_a) {
        var name = _a.name, status = _a.status, message = _a.message, details = _a.details;
        var icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        console.log("".concat(icon, " ").concat(name));
        console.log("   ".concat(message));
        if (details) {
            console.log("   Details: ".concat(JSON.stringify(details, null, 2)));
        }
        console.log();
    });
    var passed = checks.filter(function (c) { return c.status === 'pass'; }).length;
    var failed = checks.filter(function (c) { return c.status === 'fail'; }).length;
    var warnings = checks.filter(function (c) { return c.status === 'warn'; }).length;
    console.log('═══════════════════════════════════════════════════');
    console.log("SUMMARY: ".concat(passed, " passed, ").concat(failed, " failed, ").concat(warnings, " warnings"));
    console.log('═══════════════════════════════════════════════════\n');
    if (failed === 0) {
        console.log('🎉 Supabase is healthy and ready to use!');
        process.exit(0);
    }
    else {
        console.error('⚠️  Some health checks failed. Please review the issues above.');
        process.exit(1);
    }
}
runHealthCheck().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
