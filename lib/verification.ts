/**
 * Verification Engine
 * Computes control totals and generates reconciliation reports for 4-layer verification
 */

import { InternalAudit, ScreenAudit } from './estimator';
import { safeNumber, roundToDecimals } from './math';
import {
    VerificationManifest,
    VerificationStatus,
    ReconciliationReport,
    ReconciliationManifest,
    PerScreenManifest,
    ProposalTotalsManifest,
    VerificationConfig,
    DEFAULT_VERIFICATION_CONFIG,
    PerScreenReconciliation,
    VarianceDetail,
    Exception,
    LayerVerification,
    AIVerificationState,
    AIVerificationResult,
} from '../types/verification';

// ============================================================================
// MANIFEST COMPUTATION
// ============================================================================

/**
 * Compute verification manifest from Excel import data
 * Called during parseANCExcel() to capture control totals
 */
export function computeManifest(
    excelData: any,
    internalAudit: InternalAudit,
    options?: Partial<VerificationConfig>
): VerificationManifest {
    const config = { ...DEFAULT_VERIFICATION_CONFIG, ...options };
    
    // Extract Excel import metrics
    const excelImport = extractExcelImportMetrics(excelData);
    
    // Build per-screen manifests
    const perScreen = buildPerScreenManifests(excelData, internalAudit);
    
    // Build proposal totals
    const proposalTotals = buildProposalTotals(perScreen);
    
    // Reconcile source vs calculated
    const reconciliation = reconcileSourceVsCalculated(proposalTotals, config);
    
    // Initialize all 4 layers (will be filled in later)
    const layers = {
        layer1: initializeLayer1(proposalTotals),
        layer2: initializeLayer2(proposalTotals),
        layer3: initializeLayer3(proposalTotals),
        layer4: initializeLayer4(perScreen),
    };
    
    return {
        id: generateId('vrf'),
        proposalId: excelData.proposalId || 'unknown',
        timestamp: new Date().toISOString(),
        excelImport,
        perScreen,
        proposalTotals,
        reconciliation,
        layers,
    };
}

function extractExcelImportMetrics(excelData: any): VerificationManifest['excelImport'] {
    // These metrics should be captured during parseANCExcel()
    // For now, we'll extract what we can from the data
    return {
        fileName: excelData.fileName || 'unknown.xlsx',
        rowCount: excelData.rowCount || 0,
        screenCount: excelData.screens?.length || 0,
        altRowsSkipped: excelData.altRowsSkipped || 0,
        blankRowsSkipped: excelData.blankRowsSkipped || 0,
        headerRowIndex: excelData.headerRowIndex || 1,
        sheetsRead: excelData.sheetsRead || ['LED Sheet'],
    };
}

function buildPerScreenManifests(
    excelData: any,
    internalAudit: InternalAudit
): PerScreenManifest[] {
    const manifests: PerScreenManifest[] = [];
    
    const screens = excelData.screens || [];
    const perScreenAudits = internalAudit.perScreen || [];
    
    for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        const audit = perScreenAudits[i];
        
        if (!screen || !audit) continue;
        
        // Source values (from Excel)
        const source = {
            hardwareCost: safeNumber(screen.hardwareCost),
            installCost: safeNumber(screen.installCost),
            otherCost: safeNumber(screen.otherCost),
            shippingCost: safeNumber(screen.shippingCost),
            totalCost: safeNumber(screen.totalCost),
            sellPrice: safeNumber(screen.sellPrice),
            ancMargin: safeNumber(screen.ancMargin),
            bondCost: safeNumber(screen.bondCost),
            finalTotal: safeNumber(screen.finalTotal),
        };
        
        // Calculated values (from Natalia)
        const calculated = {
            hardwareCost: audit.breakdown.hardware,
            structureCost: audit.breakdown.structure,
            installCost: audit.breakdown.install,
            laborCost: audit.breakdown.labor,
            powerCost: audit.breakdown.power,
            shippingCost: audit.breakdown.shipping,
            totalCost: audit.breakdown.totalCost,
            sellPrice: audit.breakdown.sellPrice,
            ancMargin: audit.breakdown.ancMargin,
            bondCost: audit.breakdown.bondCost,
            boTaxCost: audit.breakdown.boTaxCost || 0,
            finalTotal: audit.breakdown.finalClientTotal,
        };
        
        // Variance analysis
        const variance = {
            totalCost: calculated.totalCost - source.totalCost,
            sellPrice: calculated.sellPrice - source.sellPrice,
            finalTotal: calculated.finalTotal - source.finalTotal,
            percentVariance: source.finalTotal > 0
                ? (calculated.finalTotal - source.finalTotal) / source.finalTotal
                : 0,
        };
        
        manifests.push({
            name: screen.name,
            rowIndex: screen.rowIndex || i + 2,
            areaSqFt: audit.areaSqFt,
            pixelResolution: audit.pixelResolution,
            pixelMatrix: audit.pixelMatrix || '',
            source,
            calculated,
            variance,
        });
    }
    
    return manifests;
}

function buildProposalTotals(
    perScreen: PerScreenManifest[]
): ProposalTotalsManifest {
    // Aggregate source totals
    const sourceTotals = perScreen.reduce((acc, screen) => ({
        hardwareCost: acc.hardwareCost + screen.source.hardwareCost,
        totalCost: acc.totalCost + screen.source.totalCost,
        sellPrice: acc.sellPrice + screen.source.sellPrice,
        ancMargin: acc.ancMargin + screen.source.ancMargin,
        bondCost: acc.bondCost + screen.source.bondCost,
        finalTotal: acc.finalTotal + screen.source.finalTotal,
    }), {
        hardwareCost: 0,
        totalCost: 0,
        sellPrice: 0,
        ancMargin: 0,
        bondCost: 0,
        finalTotal: 0,
    });
    
    // Aggregate calculated totals
    const calculatedTotals = perScreen.reduce((acc, screen) => ({
        hardwareCost: acc.hardwareCost + screen.calculated.hardwareCost,
        structureCost: acc.structureCost + screen.calculated.structureCost,
        installCost: acc.installCost + screen.calculated.installCost,
        laborCost: acc.laborCost + screen.calculated.laborCost,
        totalCost: acc.totalCost + screen.calculated.totalCost,
        sellPrice: acc.sellPrice + screen.calculated.sellPrice,
        ancMargin: acc.ancMargin + screen.calculated.ancMargin,
        bondCost: acc.bondCost + screen.calculated.bondCost,
        boTaxCost: acc.boTaxCost + screen.calculated.boTaxCost,
        finalTotal: acc.finalTotal + screen.calculated.finalTotal,
    }), {
        hardwareCost: 0,
        structureCost: 0,
        installCost: 0,
        laborCost: 0,
        totalCost: 0,
        sellPrice: 0,
        ancMargin: 0,
        bondCost: 0,
        boTaxCost: 0,
        finalTotal: 0,
    });
    
    // Round all totals
    (Object.keys(sourceTotals) as Array<keyof typeof sourceTotals>).forEach(key => {
        sourceTotals[key] = roundToDecimals(sourceTotals[key], 2);
    });
    (Object.keys(calculatedTotals) as Array<keyof typeof calculatedTotals>).forEach(key => {
        calculatedTotals[key] = roundToDecimals(calculatedTotals[key], 2);
    });
    
    // Variance
    const variance = {
        finalTotal: calculatedTotals.finalTotal - sourceTotals.finalTotal,
        percentVariance: sourceTotals.finalTotal > 0
            ? (calculatedTotals.finalTotal - sourceTotals.finalTotal) / sourceTotals.finalTotal
            : 0,
    };
    
    return {
        screenCount: perScreen.length,
        totalAreaSqFt: perScreen.reduce((sum, s) => sum + s.areaSqFt, 0),
        totalPixelResolution: perScreen.reduce((sum, s) => sum + s.pixelResolution, 0),
        sourceTotals,
        calculatedTotals,
        variance,
    };
}

function reconcileSourceVsCalculated(
    proposalTotals: ProposalTotalsManifest,
    config: VerificationConfig
): ReconciliationManifest {
    const { sourceTotals, calculatedTotals, variance } = proposalTotals;
    
    const absVariance = Math.abs(variance.finalTotal);
    const absPercentVariance = Math.abs(variance.percentVariance);
    
    // Determine match type
    let matchType: 'EXACT' | 'WITHIN_THRESHOLD' | 'EXCEEDS_THRESHOLD';
    let isMatch = false;
    
    if (absVariance <= config.varianceThreshold && absPercentVariance <= config.variancePercentThreshold) {
        matchType = 'EXACT';
        isMatch = true;
    } else if (absVariance <= 1.0 && absPercentVariance <= 0.001) {
        matchType = 'WITHIN_THRESHOLD';
        isMatch = true;
    } else {
        matchType = 'EXCEEDS_THRESHOLD';
        isMatch = false;
    }
    
    return {
        sourceFinalTotal: sourceTotals.finalTotal,
        calculatedFinalTotal: calculatedTotals.finalTotal,
        variance: variance.finalTotal,
        variancePercent: variance.percentVariance,
        isMatch,
        matchType,
    };
}

// ============================================================================
// LAYER INITIALIZATION
// ============================================================================

function initializeLayer1(proposalTotals: ProposalTotalsManifest): LayerVerification {
    return {
        layer: 'LAYER_1',
        name: 'Excel vs Calculation',
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
        results: {
            source: proposalTotals.sourceTotals,
            calculated: proposalTotals.calculatedTotals,
            variance: proposalTotals.variance.finalTotal,
            variancePercent: proposalTotals.variance.percentVariance,
        },
    };
}

function initializeLayer2(proposalTotals: ProposalTotalsManifest): LayerVerification {
    return {
        layer: 'LAYER_2',
        name: 'PDF vs Ugly Sheet',
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
        results: {
            source: proposalTotals.calculatedTotals,
            calculated: proposalTotals.calculatedTotals, // Same source
            variance: 0,
            variancePercent: 0,
        },
    };
}

function initializeLayer3(proposalTotals: ProposalTotalsManifest): LayerVerification {
    const finalTotal = proposalTotals.calculatedTotals.finalTotal;
    const rounded = roundToDecimals(finalTotal, 2);
    
    return {
        layer: 'LAYER_3',
        name: 'Rounding Check',
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
        results: {
            source: finalTotal,
            calculated: rounded,
            variance: finalTotal - rounded,
            variancePercent: 0,
        },
    };
}

function initializeLayer4(perScreen: PerScreenManifest[]): LayerVerification {
    return {
        layer: 'LAYER_4',
        name: 'AI Visual Verification',
        status: VerificationStatus.PENDING,
        timestamp: new Date().toISOString(),
        duration: 0,
        results: {
            source: perScreen,
            calculated: perScreen,
        },
        details: {
            checksPerformed: 0,
            checksPassed: 0,
            checksFailed: 0,
        },
    };
}

// ============================================================================
// RECONCILIATION REPORT GENERATION
// ============================================================================

/**
 * Generate human-readable reconciliation report
 * Called after verification to present results to user
 */
export function generateReconciliationReport(
    manifest: VerificationManifest,
    exceptions: Exception[],
    config?: VerificationConfig
): ReconciliationReport {
    const cfg = config || DEFAULT_VERIFICATION_CONFIG;
    
    // Determine status
    const status = determineVerificationStatus(manifest, exceptions, cfg);
    
    // Build summary
    const summary = buildSummary(manifest, exceptions);
    
    // Extract source and calculated totals
    const excelSource = {
        finalTotal: manifest.proposalTotals.sourceTotals.finalTotal,
        screenCount: manifest.excelImport.screenCount,
        bondTotal: manifest.proposalTotals.sourceTotals.bondCost,
        taxTotal: 0, // Not in source Excel
        marginPercent: manifest.proposalTotals.sourceTotals.finalTotal > 0
            ? manifest.proposalTotals.sourceTotals.ancMargin / manifest.proposalTotals.sourceTotals.sellPrice
            : 0,
    };
    
    const nataliaCalculated = {
        finalTotal: manifest.proposalTotals.calculatedTotals.finalTotal,
        screenCount: manifest.proposalTotals.screenCount,
        bondTotal: manifest.proposalTotals.calculatedTotals.bondCost,
        taxTotal: manifest.proposalTotals.calculatedTotals.boTaxCost,
        marginPercent: manifest.proposalTotals.calculatedTotals.finalTotal > 0
            ? manifest.proposalTotals.calculatedTotals.ancMargin / manifest.proposalTotals.calculatedTotals.sellPrice
            : 0,
    };
    
    // Build variance details
    const variances = {
        finalTotal: buildVarianceDetail(
            excelSource.finalTotal,
            nataliaCalculated.finalTotal,
            cfg.varianceThreshold,
            cfg.variancePercentThreshold
        ),
        screenCount: buildVarianceDetail(
            excelSource.screenCount,
            nataliaCalculated.screenCount,
            0,
            0
        ),
        bondTotal: buildVarianceDetail(
            excelSource.bondTotal,
            nataliaCalculated.bondTotal,
            cfg.varianceThreshold,
            cfg.variancePercentThreshold
        ),
        taxTotal: buildVarianceDetail(
            excelSource.taxTotal,
            nataliaCalculated.taxTotal,
            cfg.varianceThreshold,
            cfg.variancePercentThreshold
        ),
    };
    
    // Build per-screen reconciliation
    const perScreen = buildPerScreenReconciliation(manifest, cfg);
    
    // Generate recommendations
    const recommendations = generateRecommendations(manifest, exceptions, status);
    
    return {
        id: generateId('rpt'),
        proposalId: manifest.proposalId,
        timestamp: new Date().toISOString(),
        status,
        summary,
        excelSource,
        nataliaCalculated,
        variances,
        perScreen,
        exceptions,
        recommendations,
    };
}

function determineVerificationStatus(
    manifest: VerificationManifest,
    exceptions: Exception[],
    config: VerificationConfig
): VerificationStatus {
    const { reconciliation } = manifest;
    
    // Check for critical errors
    const hasCriticalErrors = exceptions.some(e => e.severity === 'CRITICAL');
    if (hasCriticalErrors) return VerificationStatus.BLOCKED;
    
    // Check for errors
    const hasErrors = exceptions.some(e => e.severity === 'ERROR');
    if (hasErrors) return VerificationStatus.ERROR;
    
    // Check reconciliation
    if (!reconciliation.isMatch) {
        return VerificationStatus.ERROR;
    }
    
    // Check for warnings
    const hasWarnings = exceptions.some(e => e.severity === 'WARNING');
    if (hasWarnings || reconciliation.matchType === 'WITHIN_THRESHOLD') {
        return VerificationStatus.WARNING;
    }
    
    // All good
    return VerificationStatus.VERIFIED;
}

function buildSummary(
    manifest: VerificationManifest,
    exceptions: Exception[]
): ReconciliationReport['summary'] {
    const perScreen = manifest.perScreen;
    const screensWithVariance = perScreen.filter(
        s => Math.abs(s.variance.finalTotal) > 0.01
    ).length;
    
    const variances = perScreen.map(s => s.variance.finalTotal);
    const totalVariance = Math.abs(manifest.proposalTotals.variance.finalTotal);
    const maxVariance = Math.max(...variances.map(Math.abs), 0);
    const avgVariance = variances.length > 0
        ? variances.reduce((sum, v) => sum + Math.abs(v), 0) / variances.length
        : 0;
    
    return {
        totalScreens: perScreen.length,
        verifiedScreens: perScreen.length - screensWithVariance,
        screensWithVariance,
        totalVariance,
        maxVariance,
        avgVariance,
    };
}

function buildVarianceDetail(
    source: number,
    calculated: number,
    threshold: number,
    percentThreshold: number
): VarianceDetail {
    const variance = calculated - source;
    const absVariance = Math.abs(variance);
    const percent = source > 0 ? variance / source : 0;
    const absPercent = Math.abs(percent);
    
    const acceptable = absVariance <= threshold && absPercent <= percentThreshold;
    
    return {
        variance,
        percent,
        acceptable,
        threshold: Math.max(threshold, source * percentThreshold),
    };
}

function buildPerScreenReconciliation(
    manifest: VerificationManifest,
    config: VerificationConfig
): PerScreenReconciliation[] {
    return manifest.perScreen.map(screen => {
        const absVariance = Math.abs(screen.variance.finalTotal);
        const absPercentVariance = Math.abs(screen.variance.percentVariance);
        
        let status: PerScreenReconciliation['status'];
        if (absVariance <= config.varianceThreshold && absPercentVariance <= config.variancePercentThreshold) {
            status = 'MATCH';
        } else if (absVariance <= 1.0 && absPercentVariance <= 0.001) {
            status = 'VARIANCE';
        } else {
            status = 'ERROR';
        }
        
        const issues: string[] = [];
        if (status === 'VARIANCE') {
            issues.push(`Variance: $${absVariance.toFixed(2)} (${(absPercentVariance * 100).toFixed(3)}%)`);
        }
        if (status === 'ERROR') {
            issues.push(`High variance: $${absVariance.toFixed(2)} (${(absPercentVariance * 100).toFixed(3)}%)`);
        }
        
        return {
            name: screen.name,
            status,
            sourceTotal: screen.source.finalTotal,
            calculatedTotal: screen.calculated.finalTotal,
            variance: screen.variance.finalTotal,
            variancePercent: screen.variance.percentVariance,
            issues,
        };
    });
}

function generateRecommendations(
    manifest: VerificationManifest,
    exceptions: Exception[],
    status: VerificationStatus
): any[] {
    const recommendations: any[] = [];
    
    // Add recommendations based on exceptions
    exceptions.forEach(exc => {
        if (exc.autoFixable && !exc.resolved) {
            recommendations.push({
                priority: exc.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
                category: 'FIX_NOW',
                title: `Fix ${exc.type}`,
                description: exc.message,
                action: {
                    type: 'FIX_NOW',
                    target: exc.id,
                },
                impact: {
                    fixesExceptions: [exc.id],
                    unblocksActions: status === VerificationStatus.BLOCKED ? ['EXPORT_PDF', 'SHARE_LINK'] : [],
                },
            });
        }
    });
    
    // Add reconciliation recommendations
    if (status === VerificationStatus.WARNING) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'REVIEW',
            title: 'Review variance',
            description: `Total variance: $${Math.abs(manifest.proposalTotals.variance.finalTotal).toFixed(2)}`,
            action: {
                type: 'REVIEW_VARIANCE',
            },
            impact: {
                fixesExceptions: [],
                unblocksActions: [],
            },
        });
    }
    
    return recommendations;
}

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
