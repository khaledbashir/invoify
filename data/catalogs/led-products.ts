
export interface LedModule {
    id: string;
    manufacturer: string;
    name: string;
    widthMm: number;
    heightMm: number;
    widthInches: number; // For easy math
    heightInches: number;
    pitch: number;
    nits: number;
    weightLbs: number;
    maxPowerWatts: number;
    supportsHalfModule: boolean;
}

export interface Catalog {
    [key: string]: LedModule;
}

export const LED_MODULES: Catalog = {
    "DEFAULT": {
        id: "default-1",
        manufacturer: "Generic",
        name: "Standard 500x500",
        widthMm: 500,
        heightMm: 500,
        widthInches: 19.685,
        heightInches: 19.685,
        pitch: 3.9,
        nits: 5000,
        weightLbs: 15,
        maxPowerWatts: 150,
        supportsHalfModule: false
    },
    // LG GSQA - The "Ferrari" Choice
    "LG-GSQA-040": {
        id: "lg-gsqa-040",
        manufacturer: "LG",
        name: "GSQA 3.9mm",
        widthMm: 250,  // Verified from Curry/Eric cheat sheet
        heightMm: 250,
        widthInches: 9.84, // 250 / 25.4
        heightInches: 9.84,
        pitch: 3.9,
        nits: 7500, // High brightness
        weightLbs: 4.5, // Lightweight
        maxPowerWatts: 85,
        supportsHalfModule: true // Native 250mm IS the module (panel is usually 500x500, so this is effectively half-panel)
    },
    // Yaham - The "Budget" Choice
    "YAHAM-S3": {
        id: "yaham-s3",
        manufacturer: "Yaham",
        name: "S3 Series",
        widthMm: 320, // Verified 320x320
        heightMm: 320,
        widthInches: 12.6, // 320 / 25.4 = 12.598
        heightInches: 12.6,
        pitch: 10, // usually higher pitch
        nits: 2000, // Standard outdoor/indoor
        weightLbs: 12,
        maxPowerWatts: 200,
        supportsHalfModule: true // Supports 160mm cuts potentially, but let's stick to base module
    }
};

export type ModuleSize = typeof LED_MODULES["DEFAULT"];
