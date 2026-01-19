#!/usr/bin/env node
"use strict";
/**
 * Export Audit Results to CSV and Markdown
 *
 * Generates human-readable reports from audit and analysis data:
 * - CSV: Machine-readable format for Excel/Google Sheets
 * - Markdown: GitHub-friendly format for documentation
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
// Load analysis results
var analysisPath = path.join(__dirname, '../reports');
var files = fs.readdirSync(analysisPath).filter(function (f) { return f.startsWith('analysis-'); });
if (files.length === 0) {
    console.error('❌ No analysis reports found. Run `npm run analyze` first.');
    process.exit(1);
}
// Use latest analysis
var latestAnalysis = files.sort().reverse()[0];
var analysisData = JSON.parse(fs.readFileSync(path.join(analysisPath, latestAnalysis), 'utf-8'));
// Export to CSV
function exportCSV() {
    var headers = [
        'Deployment Name',
        'URL',
        'Platform',
        'Status',
        'Response Time (ms)',
        'HTTP Status',
        'SSL Valid',
        'Action',
        'Priority',
        'Reason',
        'Estimated Effort'
    ];
    var rows = analysisData.recommendations.map(function (rec) { return [
        "\"".concat(rec.deployment.name, "\""),
        "\"".concat(rec.deployment.url, "\""),
        rec.deployment.platform,
        rec.auditResult.status || 'N/A',
        rec.auditResult.responseTime || 'N/A',
        rec.auditResult.httpStatus || 'N/A',
        rec.auditResult.sslValid ? 'Yes' : 'No',
        rec.action,
        rec.priority,
        "\"".concat(rec.reason, "\""),
        "\"".concat(rec.estimatedEffort, "\"")
    ]; });
    var csv = __spreadArray([
        headers.join(',')
    ], rows.map(function (row) { return row.join(','); }), true).join('\n');
    var csvPath = path.join(analysisPath, 'deployment-audit.csv');
    fs.writeFileSync(csvPath, csv);
    console.log("\u2705 CSV exported: ".concat(csvPath));
}
// Export to Markdown
function exportMarkdown() {
    var md = [];
    // Title and summary
    md.push('# FlashFusion Deployment Audit Report\n');
    md.push("**Generated:** ".concat(new Date().toISOString().split('T')[0], "\n"));
    md.push("**Total Deployments:** ".concat(analysisData.summary.total, "\n"));
    // Executive Summary
    md.push('## Executive Summary\n');
    md.push('| Metric | Count |');
    md.push('|--------|-------|');
    md.push("| \u2705 Keep | ".concat(analysisData.summary.keep, " |"));
    md.push("| \uD83D\uDD04 Migrate | ".concat(analysisData.summary.migrate, " |"));
    md.push("| \u274C Deprecate | ".concat(analysisData.summary.deprecate, " |"));
    md.push("| \uD83D\uDC40 Review | ".concat(analysisData.summary.review, " |"));
    md.push('');
    // Risk Assessment
    md.push('## Risk Assessment\n');
    if (analysisData.riskAssessment.length > 0) {
        analysisData.riskAssessment.forEach(function (risk) {
            var icon = risk.severity === 'critical' ? '🔴' : risk.severity === 'high' ? '🟠' : '🟡';
            md.push("### ".concat(icon, " ").concat(risk.type.toUpperCase(), " - ").concat(risk.severity.toUpperCase(), "\n"));
            md.push("**Description:** ".concat(risk.description, "\n"));
            md.push("**Affected Deployments:** ".concat(risk.affectedDeployments.join(', '), "\n"));
            md.push("**Mitigation:** ".concat(risk.mitigation, "\n"));
        });
    }
    else {
        md.push('✅ No significant risks identified.\n');
    }
    // Platform Breakdown
    md.push('## Platform Health\n');
    md.push('| Platform | Total | Alive | Slow | Degraded | Dead | Recommendation |');
    md.push('|----------|-------|-------|------|----------|------|----------------|');
    Object.entries(analysisData.platformBreakdown).forEach(function (_a) {
        var platform = _a[0], stats = _a[1];
        md.push("| ".concat(platform, " | ").concat(stats.total, " | ").concat(stats.alive, " | ").concat(stats.slow, " | ").concat(stats.degraded, " | ").concat(stats.dead, " | ").concat(stats.recommendation, " |"));
    });
    md.push('');
    // Detailed Recommendations
    md.push('## Detailed Recommendations\n');
    // Group by action
    var grouped = {
        KEEP: analysisData.recommendations.filter(function (r) { return r.action === 'KEEP'; }),
        MIGRATE: analysisData.recommendations.filter(function (r) { return r.action === 'MIGRATE'; }),
        DEPRECATE: analysisData.recommendations.filter(function (r) { return r.action === 'DEPRECATE'; }),
        REVIEW: analysisData.recommendations.filter(function (r) { return r.action === 'REVIEW'; })
    };
    // KEEP
    if (grouped.KEEP.length > 0) {
        md.push('### ✅ Keep (Healthy Deployments)\n');
        md.push('| Name | URL | Platform | Response Time | Status |');
        md.push('|------|-----|----------|---------------|--------|');
        grouped.KEEP.forEach(function (rec) {
            md.push("| ".concat(rec.deployment.name, " | [").concat(rec.deployment.url, "](").concat(rec.deployment.url, ") | ").concat(rec.deployment.platform, " | ").concat(rec.auditResult.responseTime, "ms | ").concat(rec.auditResult.status, " |"));
        });
        md.push('');
    }
    // MIGRATE
    if (grouped.MIGRATE.length > 0) {
        md.push('### 🔄 Migrate (Personal Account → Team Account)\n');
        md.push('| Name | URL | Platform | Priority | Effort | Reason |');
        md.push('|------|-----|----------|----------|--------|--------|');
        grouped.MIGRATE.forEach(function (rec) {
            md.push("| ".concat(rec.deployment.name, " | [").concat(rec.deployment.url, "](").concat(rec.deployment.url, ") | ").concat(rec.deployment.platform, " | ").concat(rec.priority, " | ").concat(rec.estimatedEffort, " | ").concat(rec.reason, " |"));
        });
        md.push('');
    }
    // DEPRECATE
    if (grouped.DEPRECATE.length > 0) {
        md.push('### ❌ Deprecate (Dead or Underperforming)\n');
        md.push('| Name | URL | Platform | Status | Reason |');
        md.push('|------|-----|----------|--------|--------|');
        grouped.DEPRECATE.forEach(function (rec) {
            md.push("| ".concat(rec.deployment.name, " | [").concat(rec.deployment.url, "](").concat(rec.deployment.url, ") | ").concat(rec.deployment.platform, " | ").concat(rec.auditResult.status, " | ").concat(rec.reason, " |"));
        });
        md.push('');
    }
    // REVIEW
    if (grouped.REVIEW.length > 0) {
        md.push('### 👀 Review (Requires Human Decision)\n');
        md.push('| Name | URL | Platform | Priority | Reason |');
        md.push('|------|-----|----------|----------|--------|');
        grouped.REVIEW.forEach(function (rec) {
            md.push("| ".concat(rec.deployment.name, " | [").concat(rec.deployment.url, "](").concat(rec.deployment.url, ") | ").concat(rec.deployment.platform, " | ").concat(rec.priority, " | ").concat(rec.reason, " |"));
        });
        md.push('');
    }
    // Migration Plan
    md.push('## Migration Plan\n');
    analysisData.migrationPlan.forEach(function (step) {
        md.push("### Phase ".concat(step.phase, ": ").concat(step.name, "\n"));
        md.push("**Duration:** ".concat(step.estimatedDuration, "\n"));
        md.push("**Deployments (".concat(step.deployments.length, "):** ").concat(step.deployments.join(', '), "\n"));
        md.push("**Prerequisites:**");
        step.prerequisites.forEach(function (prereq) { return md.push("- ".concat(prereq)); });
        md.push("\n**Rollback Plan:** ".concat(step.rollbackPlan, "\n"));
    });
    // Next Steps
    md.push('## Next Steps\n');
    md.push('1. **Immediate (Week 1):**');
    md.push('   - Deprecate dead instances (Phase 1)');
    md.push('   - Set up team accounts for migration targets\n');
    md.push('2. **Short-term (Weeks 2-3):**');
    md.push('   - Migrate personal account deployments (Phase 2)');
    md.push('   - Fix SSL certificate issues\n');
    md.push('3. **Medium-term (Month 2):**');
    md.push('   - Review edge cases (Phase 3)');
    md.push('   - Consolidate to 7-10 target deployments\n');
    var mdPath = path.join(analysisPath, 'deployment-audit.md');
    fs.writeFileSync(mdPath, md.join('\n'));
    console.log("\u2705 Markdown exported: ".concat(mdPath));
}
// Main execution
var format = process.argv[2] || 'both';
console.log('📊 Exporting deployment audit reports...\n');
if (format === 'csv' || format === 'both') {
    exportCSV();
}
if (format === 'md' || format === 'markdown' || format === 'both') {
    exportMarkdown();
}
console.log('\n✅ Export complete!');
console.log('\nGenerated files:');
console.log('  - deployment-audit.csv (Excel/Google Sheets)');
console.log('  - deployment-audit.md (GitHub/Documentation)');
console.log('\nUsage:');
console.log('  npm run export:csv      # CSV only');
console.log('  npm run export:md       # Markdown only');
console.log('  npm run export          # Both formats');
