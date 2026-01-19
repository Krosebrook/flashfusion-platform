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
exports.dynamic = void 0;
exports.GET = GET;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var headers_1 = require("next/headers");
/**
 * Health Check Endpoint
 *
 * Verifies:
 * - Next.js server is running
 * - Supabase connection is healthy
 * - Environment variables are configured
 */
function GET() {
    return __awaiter(this, void 0, void 0, function () {
        var checks, requiredEnvVars, missingEnvVars, cookieStore_1, supabase, error, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checks = {
                        nextjs: 'ok',
                        supabase: 'unknown',
                        env: 'unknown',
                        timestamp: new Date().toISOString(),
                    };
                    requiredEnvVars = [
                        'NEXT_PUBLIC_SUPABASE_URL',
                        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                    ];
                    missingEnvVars = requiredEnvVars.filter(function (varName) { return !process.env[varName]; });
                    if (missingEnvVars.length > 0) {
                        checks.env = "missing: ".concat(missingEnvVars.join(', '));
                        return [2 /*return*/, server_1.NextResponse.json({
                                status: 'unhealthy',
                                checks: checks,
                            }, { status: 503 })];
                    }
                    checks.env = 'ok';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, headers_1.cookies)()];
                case 2:
                    cookieStore_1 = _a.sent();
                    supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        cookies: {
                            get: function (name) {
                                var _a;
                                return (_a = cookieStore_1.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                            },
                        },
                    });
                    return [4 /*yield*/, supabase.from('user_profiles').select('id').limit(1)];
                case 3:
                    error = (_a.sent()).error;
                    if (error && error.code !== 'PGRST116') {
                        // PGRST116 = no rows found (table exists but empty)
                        checks.supabase = "error: ".concat(error.message);
                        return [2 /*return*/, server_1.NextResponse.json({
                                status: 'degraded',
                                checks: checks,
                            }, { status: 503 })];
                    }
                    checks.supabase = 'ok';
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    checks.supabase = "error: ".concat(error_1 instanceof Error ? error_1.message : 'unknown');
                    return [2 /*return*/, server_1.NextResponse.json({
                            status: 'unhealthy',
                            checks: checks,
                        }, { status: 503 })];
                case 5: 
                // All checks passed
                return [2 /*return*/, server_1.NextResponse.json({
                        status: 'healthy',
                        checks: checks,
                    })];
            }
        });
    });
}
exports.dynamic = 'force-dynamic';
