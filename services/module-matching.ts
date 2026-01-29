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
 * ModuleMatchingService
 * Calculates the number of modules required to match target dimensions.
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

    // Calculate Whole Module Option
    const wholeCountW = Math.round(targetWidthIn.div(module.widthInches).toNumber());
    const wholeCountH = Math.round(targetHeightIn.div(module.heightInches).toNumber());

    // Calculate Whole Variance
    const wholeW_ft = new Decimal(wholeCountW).mul(module.widthInches).div(12).toNumber();
    const wholeH_ft = new Decimal(wholeCountH).mul(module.heightInches).div(12).toNumber();
    const wholeDelta = Math.abs(wholeW_ft - targetWidthFt) + Math.abs(wholeH_ft - targetHeightFt);

    if (module.supportsHalfModule) {
        // Calculate Half Module Option
        // Logic: Convert target to "half-modules", round, then divide by 2
        // LG GSQA 4mm (250mm) supports half-modules natively? 
        // Actually module-blocks catalog says `supportsHalfModule` is true if defined.

        const halfCountW = Math.round(targetWidthIn.div(module.widthInches).mul(2).toNumber()) / 2;
        const halfCountH = Math.round(targetHeightIn.div(module.heightInches).mul(2).toNumber()) / 2;

        const halfW_ft = new Decimal(halfCountW).mul(module.widthInches).div(12).toNumber();
        const halfH_ft = new Decimal(halfCountH).mul(module.heightInches).div(12).toNumber();
        const halfDelta = Math.abs(halfW_ft - targetWidthFt) + Math.abs(halfH_ft - targetHeightFt);

        // REQ-32: Heuristic Preference
        // If half-module delta is smaller, use it.
        // For LG, users explicitly requested "Half-Module Heuristic Preference".
        // Use a slight bias? No, just pure math "closest wins" is usually what they mean.
        if (halfDelta <= wholeDelta) {
            countW = halfCountW;
            countH = halfCountH;
        } else {
            countW = wholeCountW;
            countH = wholeCountH;
        }
    } else {
        countW = wholeCountW;
        countH = wholeCountH;
    }

    // Calculate actual dimensions in feet
    const actualWidthFt = new Decimal(countW).mul(module.widthInches).div(12).toNumber();
    const actualHeightFt = new Decimal(countH).mul(module.heightInches).div(12).toNumber();

    const areaSqFt = new Decimal(actualWidthFt).mul(actualHeightFt).toNumber();

    return {
        moduleCountW: countW,
        moduleCountH: countH,
        totalModules: countW * countH,
        actualWidthFt: roundToDecimals(actualWidthFt, 2),
        actualHeightFt: roundToDecimals(actualHeightFt, 2),
        areaSqFt: roundToDecimals(areaSqFt, 2),
        diffWidthFt: roundToDecimals(actualWidthFt - targetWidthFt, 2),
        diffHeightFt: roundToDecimals(actualHeightFt - targetHeightFt, 2),
    };
}
