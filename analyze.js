#!/usr/bin/env node
"use strict";
/**
 * Deployment Analysis & Deprecation Recommendation Engine
 *
 * Analyzes audit results and generates actionable recommendations:
 * - KEEP: Healthy, production-ready deployments
 * - MIGRATE: Personal account deployments (bus factor risk)
 * - DEPRECATE: Slow, degraded, or redundant instances
 * - REVIEW: Requires human decision (edge cases)
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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// Load deployments and audit results
var deploymentsPath = path.join(__dirname, '../data/deployments.json');
var auditResultsPath = path.join(__dirname, '../reports/audit-latest.json');
if (!fs.existsSync(deploymentsPath)) {
    console.error('❌ deployments.json not found. Run audit first.');
    process.exit(1);
}
if (!fs.existsSync(auditResultsPath)) {
    console.error('❌ Audit results not found. Run `npm run audit` first.');
    process.exit(1);
}
var deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
var auditResults = JSON.parse(fs.readFileSync(auditResultsPath, 'utf-8'));
// Create lookup map for faster access
var auditMap = new Map();
auditResults.forEach(function (result) { return auditMap.set(result.id, result); });
// Analysis logic
function analyzeDeployment(deployment) {
    var _a;
    var audit = auditMap.get(deployment.id);
    if (!audit) {
        return {
            deployment: deployment,
            auditResult: {},
            action: 'REVIEW',
            reason: 'No audit data available',
            priority: 'P2',
            estimatedEffort: '15 min',
            dependencies: []
        };
    }
    // Bus factor risk (personal accounts)
    var isPersonalAccount = (_a = deployment.notes) === null || _a === void 0 ? void 0 : _a.includes('⚠️');
    // Dead or severely degraded
    if (audit.status === 'dead' || audit.status === 'error') {
        return {
            deployment: deployment,
            auditResult: audit,
            action: 'DEPRECATE',
            reason: "Deployment unreachable (".concat(audit.status, "). No active traffic."),
            priority: 'P3',
            estimatedEffort: '5 min',
            dependencies: []
        };
    }
    // SSL invalid
    if (audit.status === 'ssl-invalid') {
        return {
            deployment: deployment,
            auditResult: audit,
            action: 'REVIEW',
            reason: 'SSL certificate invalid. May be intentional (test environment) or security issue.',
            priority: 'P1',
            estimatedEffort: '30 min',
            dependencies: ['Verify certificate provider', 'Check DNS settings']
        };
    }
    // Personal account + alive = MIGRATE
    if (isPersonalAccount && audit.status === 'alive') {
        return {
            deployment: deployment,
            auditResult: audit,
            action: 'MIGRATE',
            reason: 'Healthy deployment on personal account. Bus factor risk.',
            priority: 'P1',
            estimatedEffort: '2-4 hours',
            dependencies: ['Team account access', 'Deploy pipeline', 'DNS migration']
        };
    }
    // Degraded performance
    if (audit.status === 'degraded') {
        return {
            deployment: deployment,
            auditResult: audit,
            action: 'DEPRECATE',
            reason: "Slow response times (".concat(audit.responseTime, "ms). User impact likely."),
            priority: 'P2',
            estimatedEffort: '1 hour',
            dependencies: ['Check for active users', 'Notify stakeholders']
        };
    }
    // Slow but functional
    if (audit.status === 'slow') {
        return {
            deployment: deployment,
            auditResult: audit,
            action: 'REVIEW',
            reason: "Slower than ideal (".concat(audit.responseTime, "ms). May need optimization or migration."),
            priority: 'P2',
            estimatedEffort: '1-2 hours',
            dependencies: ['Performance profiling', 'Check platform limits']
        };
    }
    // Healthy deployment
    return {
        deployment: deployment,
        auditResult: audit,
        action: 'KEEP',
        reason: "Healthy deployment. Response time: ".concat(audit.responseTime, "ms. SSL valid."),
        priority: 'P3',
        estimatedEffort: 'N/A',
        dependencies: []
    };
}
// Generate recommendations for all deployments
var recommendations = deployments.map(analyzeDeployment);
// Calculate summary statistics
var summary = {
    total: recommendations.length,
    keep: recommendations.filter(function (r) { return r.action === 'KEEP'; }).length,
    migrate: recommendations.filter(function (r) { return r.action === 'MIGRATE'; }).length,
    deprecate: recommendations.filter(function (r) { return r.action === 'DEPRECATE'; }).length,
    review: recommendations.filter(function (r) { return r.action === 'REVIEW'; }).length
};
// Platform breakdown
var platformBreakdown = {};
deployments.forEach(function (deployment) {
    var platform = deployment.platform;
    if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = {
            total: 0,
            alive: 0,
            slow: 0,
            degraded: 0,
            dead: 0,
            recommendation: ''
        };
    }
    var audit = auditMap.get(deployment.id);
    platformBreakdown[platform].total++;
    if (audit) {
        if (audit.status === 'alive')
            platformBreakdown[platform].alive++;
        if (audit.status === 'slow')
            platformBreakdown[platform].slow++;
        if (audit.status === 'degraded')
            platformBreakdown[platform].degraded++;
        if (audit.status === 'dead' || audit.status === 'error')
            platformBreakdown[platform].dead++;
    }
});
// Generate platform recommendations
Object.keys(platformBreakdown).forEach(function (platform) {
    var stats = platformBreakdown[platform];
    var healthyPercent = (stats.alive / stats.total) * 100;
    if (healthyPercent >= 80) {
        stats.recommendation = '✅ Stable platform. Continue using.';
    }
    else if (healthyPercent >= 50) {
        stats.recommendation = '⚠️ Mixed health. Review slow/degraded instances.';
    }
    else {
        stats.recommendation = '❌ Poor health. Consider migrating away.';
    }
});
// Risk assessment
var riskAssessment = [];
// Bus factor risk
var personalAccountDeployments = recommendations.filter(function (r) { var _a; return ((_a = r.deployment.notes) === null || _a === void 0 ? void 0 : _a.includes('⚠️')) && r.action === 'MIGRATE'; });
if (personalAccountDeployments.length > 0) {
    riskAssessment.push({
        type: 'bus-factor',
        severity: 'critical',
        description: "".concat(personalAccountDeployments.length, " production deployments on personal accounts. Single point of failure."),
        affectedDeployments: personalAccountDeployments.map(function (r) { return r.deployment.name; }),
        mitigation: 'Migrate to team/organization accounts within 30 days.'
    });
}
// Technical debt
var slowDeployments = recommendations.filter(function (r) { return r.action === 'DEPRECATE' || r.auditResult.status === 'degraded'; });
if (slowDeployments.length > 5) {
    riskAssessment.push({
        type: 'technical-debt',
        severity: 'high',
        description: "".concat(slowDeployments.length, " underperforming or dead deployments. Operational overhead."),
        affectedDeployments: slowDeployments.map(function (r) { return r.deployment.name; }),
        mitigation: 'Deprecate unused instances to reduce maintenance burden.'
    });
}
// Security risk (SSL issues)
var sslIssues = recommendations.filter(function (r) { return !r.auditResult.sslValid; });
if (sslIssues.length > 0) {
    riskAssessment.push({
        type: 'security',
        severity: 'high',
        description: "".concat(sslIssues.length, " deployments with SSL certificate issues."),
        affectedDeployments: sslIssues.map(function (r) { return r.deployment.name; }),
        mitigation: 'Fix SSL certificates or deprecate insecure deployments immediately.'
    });
}
// Migration plan
var migrationPlan = [
    {
        phase: 1,
        name: 'Deprecate Dead Instances',
        deployments: recommendations.filter(function (r) { return r.action === 'DEPRECATE'; }).map(function (r) { return r.deployment.name; }),
        estimatedDuration: '2 hours',
        prerequisites: ['Verify no active traffic', 'Export logs if needed'],
        rollbackPlan: 'N/A (read-only deprecation)'
    },
    {
        phase: 2,
        name: 'Migrate Personal Account Deployments',
        deployments: recommendations.filter(function (r) { return r.action === 'MIGRATE'; }).map(function (r) { return r.deployment.name; }),
        estimatedDuration: '1-2 weeks',
        prerequisites: ['Team account setup', 'DNS control', 'Deploy pipeline'],
        rollbackPlan: 'Revert DNS to old deployment if migration fails'
    },
    {
        phase: 3,
        name: 'Review Edge Cases',
        deployments: recommendations.filter(function (r) { return r.action === 'REVIEW'; }).map(function (r) { return r.deployment.name; }),
        estimatedDuration: '3-5 days',
        prerequisites: ['Stakeholder input', 'Performance profiling'],
        rollbackPlan: 'Maintain status quo if no clear decision'
    }
];
// Generate final report
var report = {
    summary: summary,
    recommendations: recommendations,
    platformBreakdown: platformBreakdown,
    riskAssessment: riskAssessment,
    migrationPlan: migrationPlan
};
// Save report
var reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}
var reportPath = path.join(reportsDir, "analysis-".concat(new Date().toISOString().split('T')[0], ".json"));
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
// Console output
console.log('\n📊 Deployment Analysis Report\n');
console.log('Summary:');
console.log("  Total Deployments: ".concat(summary.total));
console.log("  \u2705 Keep: ".concat(summary.keep));
console.log("  \uD83D\uDD04 Migrate: ".concat(summary.migrate));
console.log("  \u274C Deprecate: ".concat(summary.deprecate));
console.log("  \uD83D\uDC40 Review: ".concat(summary.review));
console.log('\nPlatform Health:');
Object.entries(platformBreakdown).forEach(function (_a) {
    var platform = _a[0], stats = _a[1];
    console.log("  ".concat(platform, ": ").concat(stats.alive, "/").concat(stats.total, " healthy - ").concat(stats.recommendation));
});
console.log('\nRisk Assessment:');
riskAssessment.forEach(function (risk) {
    var icon = risk.severity === 'critical' ? '🔴' : risk.severity === 'high' ? '🟠' : '🟡';
    console.log("  ".concat(icon, " [").concat(risk.severity.toUpperCase(), "] ").concat(risk.description));
});
console.log('\nMigration Plan:');
migrationPlan.forEach(function (step) {
    console.log("  Phase ".concat(step.phase, ": ").concat(step.name, " (").concat(step.deployments.length, " deployments)"));
    console.log("    Duration: ".concat(step.estimatedDuration));
});
console.log("\n\u2705 Full report saved: ".concat(reportPath));
console.log('\nNext steps:');
console.log('  1. Review recommendations: npm run analyze');
console.log('  2. Export to CSV: npm run export:csv');
console.log('  3. Generate Markdown: npm run export:md');
