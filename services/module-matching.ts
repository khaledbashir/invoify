import Decimal from 'decimal.js';
import { roundToDecimals } from '../lib/math';
import { LED_MODULES, ModuleSize } from '../data/catalogs/led-products';

export interface MatchingResult {
    moduleCountW: number;
    moduleCountH: number;
    totalModules: number;
    actualWidthFt: number;
    actualHeightFt: number;
    areaSqFt: number;
    diffWidthFt: number;
    diffHeightFt: number;
}

/**
 * ModuleMatchingService (REQ-121: Eric Gruner's "Slightly Smaller" Rule)
 * 
 * Calculates the number of modules required to match target dimensions.
 * 
 * CRITICAL RULE: Always match to "slightly smaller" than requested to avoid
 * over-promising on physical space. This prevents installation failures where
 * the display doesn't fit the structural opening.
 * 
 * Supports half-module (0.5) increments as per REQ-9.
 */
export function matchModules(
    targetWidthFt: number,
    targetHeightFt: number,
    moduleKey: string = 'DEFAULT'
): MatchingResult {
    const module = LED_MODULES[moduleKey] || LED_MODULES['DEFAULT'];

    // Convert target feet to inches
    const targetWidthIn = new Decimal(targetWidthFt).mul(12);
    const targetHeightIn = new Decimal(targetHeightFt).mul(12);

    // Calculate module counts
    let countW: number;
    let countH: number;

    // REQ-121: "Slightly Smaller" Rule (Eric Gruner mandate)
    // FLOOR the module count to ensure we never exceed the requested dimensions
    // This prevents over-promising on physical space
    
    if (module.supportsHalfModule) {
        // Half-module support: floor to nearest 0.5
        // Example: 4.7 modules → 4.5 modules (slightly smaller)
        countW = Math.floor(targetWidthIn.div(module.widthInches).mul(2).toNumber()) / 2;
        countH = Math.floor(targetHeightIn.div(module.heightInches).mul(2).toNumber()) / 2;
    } else {
        // Whole modules only: floor to nearest whole number
        // Example: 4.7 modules → 4 modules (slightly smaller)
        countW = Math.floor(targetWidthIn.div(module.widthInches).toNumber());
        countH = Math.floor(targetHeightIn.div(module.heightInches).toNumber());
    }

    // Ensure at least 1 module in each dimension
    countW = Math.max(countW, module.supportsHalfModule ? 0.5 : 1);
    countH = Math.max(countH, module.supportsHalfModule ? 0.5 : 1);

    // Calculate actual dimensions in feet (will be <= target)
    const actualWidthFt = new Decimal(countW).mul(module.widthInches).div(12).toNumber();
    const actualHeightFt = new Decimal(countH).mul(module.heightInches).div(12).toNumber();

    const areaSqFt = new Decimal(actualWidthFt).mul(actualHeightFt).toNumber();

    // Diff should be negative or zero (actual <= target)
    const diffWidthFt = actualWidthFt - targetWidthFt;
    const diffHeightFt = actualHeightFt - targetHeightFt;

    return {
        moduleCountW: countW,
        moduleCountH: countH,
        totalModules: countW * countH,
        actualWidthFt: roundToDecimals(actualWidthFt, 2),
        actualHeightFt: roundToDecimals(actualHeightFt, 2),
        areaSqFt: roundToDecimals(areaSqFt, 2),
        diffWidthFt: roundToDecimals(diffWidthFt, 2),  // Should be <= 0
        diffHeightFt: roundToDecimals(diffHeightFt, 2), // Should be <= 0
    };
}

/**
 * REQ-121: Find the best module from catalog that fits "slightly smaller"
 * 
 * Given a target size and pitch, find the module that:
 * 1. Matches the pitch requirement
 * 2. Results in actual dimensions <= target dimensions
 * 3. Maximizes the actual area (closest to target without exceeding)
 */
export function findBestFitModule(
    targetWidthFt: number,
    targetHeightFt: number,
    targetPitch: number
): { moduleKey: string; result: MatchingResult } | null {
    const candidates: { key: string; result: MatchingResult; efficiency: number }[] = [];

    for (const [key, module] of Object.entries(LED_MODULES)) {
        // Filter by pitch (allow ±1mm tolerance)
        if (Math.abs(module.pitch - targetPitch) > 1) continue;

        const result = matchModules(targetWidthFt, targetHeightFt, key);

        // REQ-121: Only accept if actual <= target (slightly smaller)
        if (result.actualWidthFt > targetWidthFt || result.actualHeightFt > targetHeightFt) {
            continue;
        }

        // Calculate efficiency (how close to target without exceeding)
        const targetArea = targetWidthFt * targetHeightFt;
        const efficiency = result.areaSqFt / targetArea;

        candidates.push({ key, result, efficiency });
    }

    if (candidates.length === 0) return null;

    // Sort by efficiency (highest first = closest to target)
    candidates.sort((a, b) => b.efficiency - a.efficiency);

    return { moduleKey: candidates[0].key, result: candidates[0].result };
}
