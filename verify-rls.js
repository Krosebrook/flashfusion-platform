"use strict";
/**
 * RLS Verification Script
 * Tests that Row Level Security policies are properly configured
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
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Admin client (bypasses RLS)
var adminClient = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
var results = [];
function runTest(test, fn, expectedMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var passed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fn()];
                case 1:
                    passed = _a.sent();
                    results.push({ test: test, passed: passed, message: passed ? '✓ PASS' : "\u2717 FAIL: ".concat(expectedMessage) });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    results.push({
                        test: test,
                        passed: false,
                        message: "\u2717 ERROR: ".concat(error_1 instanceof Error ? error_1.message : String(error_1))
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function verifyRLS() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, user1, user1Error, _b, user2, user2Error, session1, session2, client1, client2, anonClient, passedTests, totalTests, passRate;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🔒 Starting RLS Verification...\n');
                    // Create test users
                    console.log('📝 Creating test users...');
                    return [4 /*yield*/, adminClient.auth.admin.createUser({
                            email: 'test1@flashfusion.dev',
                            password: 'test-password-123',
                            email_confirm: true
                        })];
                case 1:
                    _a = _c.sent(), user1 = _a.data, user1Error = _a.error;
                    return [4 /*yield*/, adminClient.auth.admin.createUser({
                            email: 'test2@flashfusion.dev',
                            password: 'test-password-456',
                            email_confirm: true
                        })];
                case 2:
                    _b = _c.sent(), user2 = _b.data, user2Error = _b.error;
                    if (user1Error || user2Error || !(user1 === null || user1 === void 0 ? void 0 : user1.user) || !(user2 === null || user2 === void 0 ? void 0 : user2.user)) {
                        console.error('❌ Failed to create test users');
                        return [2 /*return*/];
                    }
                    console.log('✅ Test users created\n');
                    return [4 /*yield*/, adminClient.auth.signInWithPassword({
                            email: 'test1@flashfusion.dev',
                            password: 'test-password-123'
                        })];
                case 3:
                    session1 = (_c.sent()).data;
                    return [4 /*yield*/, adminClient.auth.signInWithPassword({
                            email: 'test2@flashfusion.dev',
                            password: 'test-password-456'
                        })];
                case 4:
                    session2 = (_c.sent()).data;
                    if (!(session1 === null || session1 === void 0 ? void 0 : session1.session) || !(session2 === null || session2 === void 0 ? void 0 : session2.session)) {
                        console.error('❌ Failed to authenticate test users');
                        return [2 /*return*/];
                    }
                    client1 = (0, supabase_js_1.createClient)(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        global: { headers: { Authorization: "Bearer ".concat(session1.session.access_token) } }
                    });
                    client2 = (0, supabase_js_1.createClient)(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        global: { headers: { Authorization: "Bearer ".concat(session2.session.access_token) } }
                    });
                    // Test 1: Users can read their own profile
                    return [4 /*yield*/, runTest('User can read their own profile', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, client1
                                            .from('user_profiles')
                                            .select('*')
                                            .eq('id', user1.user.id)
                                            .single()];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        return [2 /*return*/, !error && data !== null];
                                }
                            });
                        }); }, 'User should be able to read their own profile')];
                case 5:
                    // Test 1: Users can read their own profile
                    _c.sent();
                    // Test 2: Users cannot read other users' profiles
                    return [4 /*yield*/, runTest('User cannot read other users profiles', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, client1
                                            .from('user_profiles')
                                            .select('*')
                                            .eq('id', user2.user.id)
                                            .single()];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        return [2 /*return*/, data === null || error !== null];
                                }
                            });
                        }); }, 'User should NOT be able to read other profiles')];
                case 6:
                    // Test 2: Users cannot read other users' profiles
                    _c.sent();
                    // Test 3: Users can create their own app_generations
                    return [4 /*yield*/, runTest('User can create their own generation', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, client1
                                            .from('app_generations')
                                            .insert({
                                            user_id: user1.user.id,
                                            app_name: 'Test App 1',
                                            platform: 'web',
                                            framework: 'nextjs',
                                            config: { features: ['auth', 'database'] }
                                        })
                                            .select()
                                            .single()];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        return [2 /*return*/, !error && data !== null];
                                }
                            });
                        }); }, 'User should be able to create their own generation')];
                case 7:
                    // Test 3: Users can create their own app_generations
                    _c.sent();
                    // Test 4: Users cannot create generations for other users
                    return [4 /*yield*/, runTest('User cannot create generation for other user', function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, client1
                                            .from('app_generations')
                                            .insert({
                                            user_id: user2.user.id, // Trying to create for user2
                                            app_name: 'Malicious App',
                                            platform: 'web',
                                            framework: 'nextjs',
                                            config: { features: [] }
                                        })];
                                    case 1:
                                        error = (_a.sent()).error;
                                        return [2 /*return*/, error !== null];
                                }
                            });
                        }); }, 'User should NOT be able to create generation for other users')];
                case 8:
                    // Test 4: Users cannot create generations for other users
                    _c.sent();
                    // Test 5: Users can only view their own generations
                    return [4 /*yield*/, runTest('User can only view their own generations', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, client1
                                            .from('app_generations')
                                            .select('*')];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        if (error || !data)
                                            return [2 /*return*/, false];
                                        // All returned generations should belong to user1
                                        return [2 /*return*/, data.every(function (gen) { return gen.user_id === user1.user.id; })];
                                }
                            });
                        }); }, 'User should only see their own generations')];
                case 9:
                    // Test 5: Users can only view their own generations
                    _c.sent();
                    anonClient = (0, supabase_js_1.createClient)(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                    return [4 /*yield*/, runTest('Anonymous user cannot read profiles', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, anonClient
                                            .from('user_profiles')
                                            .select('*')];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        return [2 /*return*/, error !== null || (data && data.length === 0)];
                                }
                            });
                        }); }, 'Anonymous users should NOT access profiles')];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, runTest('Anonymous user cannot read generations', function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, data, error;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, anonClient
                                            .from('app_generations')
                                            .select('*')];
                                    case 1:
                                        _a = _b.sent(), data = _a.data, error = _a.error;
                                        return [2 /*return*/, error !== null || (data && data.length === 0)];
                                }
                            });
                        }); }, 'Anonymous users should NOT access generations')];
                case 11:
                    _c.sent();
                    // Cleanup
                    console.log('\n🧹 Cleaning up test users...');
                    return [4 /*yield*/, adminClient.auth.admin.deleteUser(user1.user.id)];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, adminClient.auth.admin.deleteUser(user2.user.id)];
                case 13:
                    _c.sent();
                    console.log('✅ Cleanup complete\n');
                    // Print results
                    console.log('═══════════════════════════════════════════════════');
                    console.log('                  RLS TEST RESULTS                  ');
                    console.log('═══════════════════════════════════════════════════\n');
                    results.forEach(function (_a) {
                        var test = _a.test, passed = _a.passed, message = _a.message;
                        console.log("".concat(passed ? '✅' : '❌', " ").concat(test));
                        console.log("   ".concat(message, "\n"));
                    });
                    passedTests = results.filter(function (r) { return r.passed; }).length;
                    totalTests = results.length;
                    passRate = Math.round((passedTests / totalTests) * 100);
                    console.log('═══════════════════════════════════════════════════');
                    console.log("SUMMARY: ".concat(passedTests, "/").concat(totalTests, " tests passed (").concat(passRate, "%)"));
                    console.log('═══════════════════════════════════════════════════\n');
                    if (passedTests === totalTests) {
                        console.log('🎉 All RLS policies are working correctly!');
                        process.exit(0);
                    }
                    else {
                        console.error('⚠️  Some RLS policies need attention');
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
verifyRLS().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});
