import { LED_MODULES, LedModule, Catalog } from "@/data/catalogs/led-products";

export interface ScreenSpec {
    widthFt: number;
    heightFt: number;
    pixelPitch?: number; // Desired pitch from RFP
    isOutdoor?: boolean; // Inferred from context or explicit
    manufacturer?: string; // Optional preference
}

export interface MatchedSolution {
    module: LedModule;
    cols: number;
    rows: number;
    activeWidthMm: number;
    activeHeightMm: number;
    activeWidthFt: number;
    activeHeightFt: number;
    resolutionX: number;
    resolutionY: number;
    totalModules: number;
    fitScore: number; // 0-100 (100 = perfect match)
}

/**
 * Product Matcher Service
 * Algorithms to select the best "Ferrari-Grade" LED product for a given loose specification.
 */
export class ProductMatcher {

    /**
     * Find the best matching LED product for a given screen specification.
     */
    static matchProduct(spec: ScreenSpec): MatchedSolution {
        const candidates = Object.values(LED_MODULES).filter(m => m.id !== "default-1");

        // 1. Filter by Environment (Outdoor vs Indoor)
        // Heuristic: Outdoor modules usually have pitch >= 6mm and high nits (> 5000), 
        // or explicitly have "Outdoor" in name.
        const isOutdoorRequest = spec.isOutdoor === true;

        let suitable = candidates.filter(m => {
            const isOutdoorModule = m.name.toLowerCase().includes("outdoor") || m.nits >= 5000;
            return isOutdoorRequest ? isOutdoorModule : !isOutdoorModule;
        });

        // Fallback: If no suitable environment match, use all candidates (rare edge case)
        if (suitable.length === 0) suitable = candidates;

        // 2. Filter by Pitch (if specified)
        // If pitch is extracted (e.g. 10mm), look for close matches (+- 1mm)
        // If no pitch, default to standard (10mm for outdoor, 3.9mm for indoor)
        const targetPitch = spec.pixelPitch || (isOutdoorRequest ? 10 : 3.9);

        // Sort by closeness to target pitch
        suitable.sort((a, b) => Math.abs(a.pitch - targetPitch) - Math.abs(b.pitch - targetPitch));

        // Pick the top candidate (closest pitch)
        // In a real Ferrari system, we might offer "Good, Better, Best" options.
        // For now, we pick the "Best Fit".
        const bestModule = suitable[0] || LED_MODULES["DEFAULT"];

        // 3. Calculate Matrix
        // Dimensions in mm
        const targetWidthMm = spec.widthFt * 304.8;
        const targetHeightMm = spec.heightFt * 304.8;

        const cols = Math.round(targetWidthMm / bestModule.widthMm);
        const rows = Math.round(targetHeightMm / bestModule.heightMm);

        const activeWidthMm = cols * bestModule.widthMm;
        const activeHeightMm = rows * bestModule.heightMm;

        const activeWidthFt = activeWidthMm / 304.8;
        const activeHeightFt = activeHeightMm / 304.8;

        return {
            module: bestModule,
            cols,
            rows,
            activeWidthMm,
            activeHeightMm,
            activeWidthFt,
            activeHeightFt,
            resolutionX: Math.round(activeWidthMm / bestModule.pitch),
            resolutionY: Math.round(activeHeightMm / bestModule.pitch),
            totalModules: cols * rows,
            fitScore: 95 // Mock score for now
        };
    }
}
