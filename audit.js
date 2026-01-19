"use strict";
/**
 * Deployment Health Audit Script
 * Tests all FlashFusion deployment URLs and generates health report
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = __importDefault(require("https"));
var http_1 = __importDefault(require("http"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var TIMEOUT_MS = 10000;
var SLOW_THRESHOLD_MS = 3000;
var DEGRADED_THRESHOLD_MS = 10000;
function testUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var startTime = Date.now();
                    var urlObj = new URL(url);
                    var client = urlObj.protocol === 'https:' ? https_1.default : http_1.default;
                    var req = client.get(url, {
                        timeout: TIMEOUT_MS,
                        headers: {
                            'User-Agent': 'FlashFusion-Audit-Bot/1.0'
                        }
                    }, function (res) {
                        var responseTime = Date.now() - startTime;
                        // Consume response to prevent memory leak
                        res.resume();
                        resolve({
                            status: res.statusCode || 0,
                            responseTime: responseTime,
                            sslValid: true
                        });
                    });
                    req.on('error', function (error) {
                        var responseTime = Date.now() - startTime;
                        // Check for SSL errors
                        var sslValid = !error.message.includes('CERT_') &&
                            !error.message.includes('SSL');
                        resolve({
                            status: 0,
                            responseTime: responseTime,
                            sslValid: sslValid,
                            error: error.message
                        });
                    });
                    req.on('timeout', function () {
                        req.destroy();
                        resolve({
                            status: 0,
                            responseTime: TIMEOUT_MS,
                            sslValid: true,
                            error: 'Request timeout'
                        });
                    });
                })];
        });
    });
}
function determineStatus(httpStatus, responseTime, sslValid, error) {
    if (!sslValid)
        return 'ssl-invalid';
    if (httpStatus === 0 || httpStatus >= 400 || error)
        return 'dead';
    if (responseTime > DEGRADED_THRESHOLD_MS)
        return 'degraded';
    if (responseTime > SLOW_THRESHOLD_MS)
        return 'slow';
    return 'alive';
}
function makeRecommendation(deployment, result) {
    // KEEP criteria
    if (deployment.purpose === 'primary') {
        return 'KEEP - Primary production instance';
    }
    if (deployment.purpose === 'feature' && result.status === 'alive') {
        return 'KEEP - Unique feature, still functional';
    }
    if (deployment.notes.includes('KEEP')) {
        return 'KEEP - Marked as essential';
    }
    // MIGRATE criteria
    if (deployment.notes.includes('PERSONAL ACCOUNT')) {
        return '⚠️  MIGRATE - Bus factor risk on personal account';
    }
    // DEPRECATE criteria
    if (result.status === 'dead') {
        return 'DEPRECATE - Deployment is dead';
    }
    if (deployment.notes.includes('duplicate')) {
        return 'DEPRECATE - Duplicate of another instance';
    }
    if (deployment.notes.includes('Unknown purpose')) {
        return 'DEPRECATE - No clear purpose documented';
    }
    if (deployment.purpose === 'testing' && result.status !== 'alive') {
        return 'DEPRECATE - Test instance no longer functional';
    }
    // REVIEW criteria
    if (result.status === 'slow' || result.status === 'degraded') {
        return 'REVIEW - Performance issues detected';
    }
    return 'REVIEW - Manual review recommended';
}
function runAudit(platformFilter) {
    return __awaiter(this, void 0, void 0, function () {
        var deploymentsPath, deploymentsData, deployments, deploymentsToTest, byPlatform, results, _i, _a, _b, platform, platformDeployments, _c, platformDeployments_1, deployment, testResult, status_1, result, icon, timeStr, statusStr, summary, toDeprecate, toMigrate, toKeep;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('🔍 FlashFusion Deployment Health Audit');
                    console.log('━'.repeat(50) + '\n');
                    deploymentsPath = path_1.default.join(__dirname, '../data/deployments.json');
                    return [4 /*yield*/, promises_1.default.readFile(deploymentsPath, 'utf-8')];
                case 1:
                    deploymentsData = _d.sent();
                    deployments = JSON.parse(deploymentsData).deployments;
                    deploymentsToTest = deployments;
                    if (platformFilter) {
                        deploymentsToTest = deploymentsToTest.filter(function (d) { return d.platform.toLowerCase() === platformFilter.toLowerCase(); });
                        console.log("\uD83D\uDCCA Testing ".concat(deploymentsToTest.length, " ").concat(platformFilter, " deployments...\n"));
                    }
                    else {
                        console.log("\uD83D\uDCCA Testing ".concat(deploymentsToTest.length, " deployments across all platforms...\n"));
                    }
                    byPlatform = deploymentsToTest.reduce(function (acc, d) {
                        if (!acc[d.platform])
                            acc[d.platform] = [];
                        acc[d.platform].push(d);
                        return acc;
                    }, {});
                    results = [];
                    _i = 0, _a = Object.entries(byPlatform);
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], platform = _b[0], platformDeployments = _b[1];
                    console.log("\n".concat(platform.toUpperCase(), " (").concat(platformDeployments.length, ")"));
                    console.log('─'.repeat(50));
                    _c = 0, platformDeployments_1 = platformDeployments;
                    _d.label = 3;
                case 3:
                    if (!(_c < platformDeployments_1.length)) return [3 /*break*/, 6];
                    deployment = platformDeployments_1[_c];
                    return [4 /*yield*/, testUrl(deployment.url)];
                case 4:
                    testResult = _d.sent();
                    status_1 = determineStatus(testResult.status, testResult.responseTime, testResult.sslValid, testResult.error);
                    result = {
                        id: deployment.id,
                        name: deployment.name,
                        url: deployment.url,
                        platform: deployment.platform,
                        status: status_1,
                        httpStatus: testResult.status,
                        responseTime: testResult.responseTime,
                        sslValid: testResult.sslValid,
                        error: testResult.error,
                        recommendation: '',
                        tested_at: new Date().toISOString()
                    };
                    result.recommendation = makeRecommendation(deployment, result);
                    results.push(result);
                    icon = status_1 === 'alive' ? '✅' :
                        status_1 === 'slow' ? '⚠️ ' :
                            status_1 === 'degraded' ? '🐌' :
                                status_1 === 'ssl-invalid' ? '🔒' : '❌';
                    timeStr = testResult.responseTime ? "".concat(testResult.responseTime, "ms") : 'N/A';
                    statusStr = testResult.status ? "HTTP ".concat(testResult.status) : testResult.error || 'Unknown';
                    console.log("  ".concat(icon, " ").concat(deployment.name));
                    console.log("     ".concat(deployment.url));
                    console.log("     ".concat(statusStr, " - ").concat(timeStr));
                    if (result.recommendation.includes('DEPRECATE') || result.recommendation.includes('MIGRATE')) {
                        console.log("     \uD83D\uDCA1 ".concat(result.recommendation));
                    }
                    _d.label = 5;
                case 5:
                    _c++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    summary = {
                        total: results.length,
                        alive: results.filter(function (r) { return r.status === 'alive'; }).length,
                        slow: results.filter(function (r) { return r.status === 'slow'; }).length,
                        degraded: results.filter(function (r) { return r.status === 'degraded'; }).length,
                        dead: results.filter(function (r) { return r.status === 'dead'; }).length,
                        sslInvalid: results.filter(function (r) { return r.status === 'ssl-invalid'; }).length,
                        platforms: Object.fromEntries(Object.entries(byPlatform).map(function (_a) {
                            var p = _a[0], deps = _a[1];
                            return [p, deps.length];
                        }))
                    };
                    // Print summary
                    console.log('\n' + '━'.repeat(50));
                    console.log('SUMMARY');
                    console.log('━'.repeat(50));
                    console.log("Total:         ".concat(summary.total, " deployments"));
                    console.log("Alive:         ".concat(summary.alive, " (").concat(Math.round(summary.alive / summary.total * 100), "%)"));
                    console.log("Slow:          ".concat(summary.slow, " (").concat(Math.round(summary.slow / summary.total * 100), "%)"));
                    console.log("Degraded:      ".concat(summary.degraded, " (").concat(Math.round(summary.degraded / summary.total * 100), "%)"));
                    console.log("Dead:          ".concat(summary.dead, " (").concat(Math.round(summary.dead / summary.total * 100), "%)"));
                    console.log("SSL Issues:    ".concat(summary.sslInvalid, " (").concat(Math.round(summary.sslInvalid / summary.total * 100), "%)"));
                    toDeprecate = results.filter(function (r) { return r.recommendation.includes('DEPRECATE'); }).length;
                    toMigrate = results.filter(function (r) { return r.recommendation.includes('MIGRATE'); }).length;
                    toKeep = results.filter(function (r) { return r.recommendation.includes('KEEP'); }).length;
                    console.log("\nRecommendation: Deprecate ".concat(toDeprecate, ", Migrate ").concat(toMigrate, ", Keep ").concat(toKeep));
                    console.log('━'.repeat(50) + '\n');
                    return [2 /*return*/, {
                            timestamp: new Date().toISOString(),
                            summary: summary,
                            results: results
                        }];
            }
        });
    });
}
function saveReport(report) {
    return __awaiter(this, void 0, void 0, function () {
        var reportsDir, timestamp, filename, filepath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportsDir = path_1.default.join(__dirname, '../reports');
                    return [4 /*yield*/, promises_1.default.mkdir(reportsDir, { recursive: true })];
                case 1:
                    _a.sent();
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    filename = "audit-".concat(timestamp, ".json");
                    filepath = path_1.default.join(reportsDir, filename);
                    return [4 /*yield*/, promises_1.default.writeFile(filepath, JSON.stringify(report, null, 2))];
                case 2:
                    _a.sent();
                    console.log("\uD83D\uDCBE Report saved to: ".concat(filepath, "\n"));
                    return [2 /*return*/];
            }
        });
    });
}
// Main execution
var platformFilter = process.argv[2];
runAudit(platformFilter)
    .then(function (report) { return saveReport(report); })
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});
