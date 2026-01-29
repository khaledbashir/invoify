export interface ModuleSize {
    widthInches: number;
    heightInches: number;
    pitchMm: number;
    nits: number;
    supportsHalfModule: boolean;
    halfModuleHeightInches?: number;
    halfModuleWidthInches?: number;
}

export const LED_MODULES: Record<string, ModuleSize> = {
    'LG-GSQA-4MM': { 
        widthInches: 19.7, // 500mm
        heightInches: 19.7, 
        pitchMm: 4,
        nits: 7500,
        supportsHalfModule: true,
        halfModuleHeightInches: 9.85, // 250mm
        halfModuleWidthInches: 9.85
    },
    'YAHAM-10MM-INDOOR': { 
        widthInches: 12.6, // 320mm
        heightInches: 12.6, 
        pitchMm: 10,
        nits: 2000,
        supportsHalfModule: true,
        halfModuleWidthInches: 6.3, // 160mm
        halfModuleHeightInches: 6.3
    },
    'DEFAULT': { 
        widthInches: 10, 
        heightInches: 10, 
        pitchMm: 10,
        nits: 1200,
        supportsHalfModule: false 
    },
};
