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
        widthInches: 9.84, // 250mm (Module Level)
        heightInches: 9.84,
        pitchMm: 4,
        nits: 7500,
        supportsHalfModule: false, // 250mm is the atomic unit
    },
    'YAHAM-10MM-INDOOR': {
        widthInches: 12.6, // 320mm (Module Level)
        heightInches: 12.6,
        pitchMm: 10,
        nits: 2000,
        supportsHalfModule: false,
    },
    'DEFAULT': {
        widthInches: 10,
        heightInches: 10,
        pitchMm: 10,
        nits: 1200,
        supportsHalfModule: false
    },
};
