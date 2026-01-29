import fs from 'fs';
import path from 'path';

/**
 * import-catalog.ts
 * 
 * This script transforms a source CSV/JSON (from Eric/Curry) into the 
 * MODULE_CATALOG structure used by the ANC Intelligence Engine.
 * 
 * Usage: npx ts-node scripts/import-catalog.ts path/to/source.json
 */

interface RawModule {
    modelName: string;
    pitch: number;
    widthInches: number;
    heightInches: number;
    supportsHalf?: boolean;
    halfWidth?: number;
    halfHeight?: number;
}

async function main() {
    const sourcePath = process.argv[2];
    if (!sourcePath) {
        console.error("Usage: npx ts-node scripts/import-catalog.ts <source.json>");
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const catalog: Record<string, any> = {};

    rawData.forEach((m: RawModule) => {
        const key = m.modelName.toUpperCase().replace(/\s+/g, '-');
        catalog[key] = {
            widthInches: m.widthInches,
            heightInches: m.heightInches,
            pitchMm: m.pitch,
            supportsHalfModule: m.supportsHalf || false,
            halfModuleWidthInches: m.halfWidth,
            halfModuleHeightInches: m.halfHeight
        };
    });

    const outputPath = path.join(__dirname, '../services/module-catalog-generated.ts');
    const fileContent = `/**
 * GENERATED MODULE CATALOG
 * Generated on ${new Date().toISOString()}
 */

export const MODULE_CATALOG_EXTENDED = ${JSON.stringify(catalog, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`✓ Catalog imported successfully to ${outputPath}`);
    console.log(`✓ ${Object.keys(catalog).length} modules processed.`);
}

// main().catch(console.error);
console.log("Template script created. Uncomment main() call to use.");
