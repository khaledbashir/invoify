
import * as fs from 'fs';
import * as path from 'path';
import { parseANCExcel } from './services/invoice/server/excelImportService';

async function run() {
    const filePath = '/root/invo/Cost Analysis - Indiana Fever - 2026-01-22 (2).xlsx';

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    try {
        const buffer = fs.readFileSync(filePath);
        const result = await parseANCExcel(buffer);

        console.log("=== PARSING RESULT ===");
        console.log("Client Name:", result.clientName);
        console.log("Project Name:", result.proposalName);
        console.log("\n--- SCREENS FOUND: " + result.screens.length + " ---");
        result.screens.forEach((s, i) => {
            console.log(`\nScreen ${i + 1}: ${s.name}`);
            console.log(`Dims: ${s.heightFt}' x ${s.widthFt}'`);
            console.log(`Resolution: ${s.pixelsH} x ${s.pixelsW}`);
            console.log(`Pitch: ${s.pitchMm}mm`);
            console.log(`Brightness (Extracted):`, s.brightness);
            console.log(`Line Items (Mirror Mode):`, s.lineItems.length);
            if (s.lineItems.length > 0) {
                console.log("  [Mirror Items Sample]");
                s.lineItems.slice(0, 3).forEach((li: any) => console.log(`  - ${li.category}: $${li.price}`));
            } else {
                console.log("  [!] No mirror items found - falling back to calculated?");
            }
        });

        console.log("\n--- INTERNAL AUDIT TOTALS ---");
        console.log(JSON.stringify(result.internalAudit.totals, null, 2));

    } catch (e) {
        console.error("Error parsing Excel:", e);
    }
}

run();
