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

    if (module.supportsHalfModule) {
        // Round to nearest 0.5 module if dimensions allow
        const canHalfW = module.halfModuleWidthInches && module.halfModuleWidthInches === module.widthInches / 2;
        const canHalfH = module.halfModuleHeightInches && module.halfModuleHeightInches === module.heightInches / 2;

        countW = canHalfW 
            ? Math.round(targetWidthIn.div(module.widthInches).mul(2).toNumber()) / 2
            : Math.round(targetWidthIn.div(module.widthInches).toNumber());
            
        countH = canHalfH
            ? Math.round(targetHeightIn.div(module.heightInches).mul(2).toNumber()) / 2
            : Math.round(targetHeightIn.div(module.heightInches).toNumber());
    } else {
        // Round to nearest whole module
        countW = Math.round(targetWidthIn.div(module.widthInches).toNumber());
        countH = Math.round(targetHeightIn.div(module.heightInches).toNumber());
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
