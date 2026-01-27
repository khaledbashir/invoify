/**
 * Audit-Ready Excel Export Service (Ferrari Edition)
 * 
 * Generates a "Formulaic" audit report for Finance.
 * Senior estimators can change inputs in Excel and see recalcs instantly.
 */

import ExcelJS from 'exceljs';
import { ScreenInput, ScreenAudit } from '@/lib/estimator';

export interface AuditExcelOptions {
    proposalName?: string;
    clientName?: string;
    proposalDate?: string;
    status?: 'DRAFT' | 'FINAL';
}

/**
 * Generate Formulaic Audit Excel Workbook
 */
export async function generateAuditExcel(
    screens: any[],
    options?: AuditExcelOptions
): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ANC Ferrari Intelligence';
    workbook.created = new Date();

    const auditSheet = workbook.addWorksheet('Internal Audit (Formulas)', {
        properties: { tabColor: { argb: 'FF0A52EF' } } // ANC French Blue
    });

    // Build Audit Sheet
    buildFormulaicAudit(auditSheet, screens, options);

    return workbook;
}

function buildFormulaicAudit(sheet: ExcelJS.Worksheet, screens: any[], options?: AuditExcelOptions) {
    // Header
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `ANC INTERNAL AUDIT & MARGIN ANALYSIS - ${options?.proposalName || 'PROPOSAL'}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A52EF' } };
    titleCell.alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:G2');
    sheet.getCell('A2').value = `Client: ${options?.clientName || 'N/A'} | Date: ${options?.proposalDate || new Date().toLocaleDateString()}`;
    sheet.getCell('A2').font = { italic: true };

    const HEADER_ROW = 4;
    let currentRow = 5;

    // Column Headers
    const headers = [
        { col: 'A', label: 'Screen / Section', width: 35 },
        { col: 'B', label: 'Metric', width: 25 },
        { col: 'C', label: 'Input Value', width: 15 },
        { col: 'D', label: 'Formula / Logic', width: 40 },
        { col: 'E', label: 'Total Cost', width: 18 },
        { col: 'F', label: 'Margin %', width: 12 },
        { col: 'G', label: 'Sell Price (Divisor)', width: 20 },
    ];

    headers.forEach(h => {
        const cell = sheet.getCell(`${h.col}${HEADER_ROW}`);
        cell.value = h.label;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }; // Dark grey
        cell.alignment = { horizontal: 'center' };
        sheet.getColumn(h.col).width = h.width;
    });

    screens.forEach((screen, idx) => {
        const audit = screen.internalAudit || screen._internalAudit || screen.audit;
        const b = audit?.breakdown || {};

        // Section Header
        sheet.mergeCells(`A${currentRow}:G${currentRow}`);
        const sectionCell = sheet.getCell(`A${currentRow}`);
        sectionCell.value = `DISPLAY ${idx + 1}: ${screen.name || 'Unnamed'}`;
        sectionCell.font = { bold: true };
        sectionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF5FB' } };
        currentRow++;

        // 1. HARDWARE SECTION
        const hwRow = currentRow;
        sheet.getCell(`A${currentRow}`).value = 'Hardware';
        sheet.getCell(`B${currentRow}`).value = 'Area (SqFt)';
        sheet.getCell(`C${currentRow}`).value = audit?.areaSqFt || 0;
        sheet.getCell(`D${currentRow}`).value = 'Qty * Height * Width';

        // Cost per SqFt (Input)
        currentRow++;
        sheet.getCell(`B${currentRow}`).value = 'Unit Cost ($/SqFt)';
        sheet.getCell(`C${currentRow}`).value = screen.costPerSqFt || 120;

        // Spare Parts Toggle (Visual indicator)
        currentRow++;
        sheet.getCell(`B${currentRow}`).value = 'Spare Parts (5%)';
        sheet.getCell(`C${currentRow}`).value = screen.includeSpareParts ? 'YES' : 'NO';

        // Hardware Total Cost Formula
        // E[hwRow] = C[hwRow] * C[hwRow+1] * (IF(C[hwRow+2]="YES", 1.05, 1))
        const costCell = sheet.getCell(`E${hwRow}`);
        costCell.value = {
            formula: `C${hwRow}*C${hwRow + 1}*(IF(C${hwRow + 2}="YES", 1.05, 1))`
        };
        costCell.numFmt = '"$"#,##0.00';
        costCell.font = { bold: true };

        currentRow++; // Move past spare parts row

        // 2. SOFT COSTS (PROXIED)
        currentRow++;
        sheet.getCell(`A${currentRow}`).value = 'Support Services';
        sheet.getCell(`B${currentRow}`).value = 'Install/Structure/Labor';
        const softCostTotal = (b.install || 0) + (b.labor || 0) + (b.structure || 0) + (b.power || 0) + (b.shipping || 0) + (b.pm || 0);
        sheet.getCell(`C${currentRow}`).value = softCostTotal;
        sheet.getCell(`D${currentRow}`).value = 'Est. Support Costs';
        sheet.getCell(`E${currentRow}`).value = { formula: `C${currentRow}` };
        sheet.getCell(`E${currentRow}`).numFmt = '"$"#,##0.00';

        // 3. FINAL MATH (THE DIVISOR)
        currentRow += 2;
        const totalCostRow = currentRow;
        sheet.getCell(`A${currentRow}`).value = 'TOTAL COST (C)';
        sheet.getCell(`E${currentRow}`).value = { formula: `SUM(E${hwRow},E${currentRow - 2})` };
        sheet.getCell(`E${currentRow}`).font = { bold: true };
        sheet.getCell(`E${currentRow}`).numFmt = '"$"#,##0.00';

        currentRow++;
        const marginRow = currentRow;
        sheet.getCell(`A${currentRow}`).value = 'DESIRED MARGIN (M)';
        sheet.getCell(`F${currentRow}`).value = screen.desiredMargin || 0.25;
        sheet.getCell(`F${currentRow}`).numFmt = '0%';
        sheet.getCell(`F${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Highlight Editable

        currentRow++;
        const sellPriceRow = currentRow;
        sheet.getCell(`A${currentRow}`).value = 'SELL PRICE (P)';
        sheet.getCell(`D${currentRow}`).value = 'Cost / (1 - Margin)';
        sheet.getCell(`G${currentRow}`).value = { formula: `E${totalCostRow}/(1-F${marginRow})` };
        sheet.getCell(`G${currentRow}`).font = { bold: true, color: { argb: 'FF0A52EF' } };
        sheet.getCell(`G${currentRow}`).numFmt = '"$"#,##0.00';

        currentRow++;
        const bondRow = currentRow;
        sheet.getCell(`A${currentRow}`).value = 'LABOR BOND (1.5%)';
        sheet.getCell(`D${currentRow}`).value = 'Sell Price * 0.015';
        sheet.getCell(`G${currentRow}`).value = { formula: `G${sellPriceRow}*0.015` };
        sheet.getCell(`G${currentRow}`).numFmt = '"$"#,##0.00';

        currentRow++;
        sheet.getCell(`A${currentRow}`).value = 'FINAL CLIENT TOTAL';
        sheet.getCell(`G${currentRow}`).value = { formula: `G${sellPriceRow}+G${bondRow}` };
        sheet.getCell(`G${currentRow}`).font = { bold: true, size: 12 };
        sheet.getCell(`G${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        sheet.getCell(`G${currentRow}`).numFmt = '"$"#,##0.00';

        currentRow += 2; // Spacer
    });

    // Summary Totals at the bottom
    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    sheet.getCell(`A${currentRow}`).value = 'GRAND TOTAL SUMMARY';
    sheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
    sheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    currentRow++;

    sheet.getCell(`A${currentRow}`).value = 'PROJECT TOTAL';
    sheet.getCell(`G${currentRow}`).value = { formula: `SUMIF(A1:A${currentRow - 1}, "FINAL CLIENT TOTAL", G1:G${currentRow - 1})` };
    sheet.getCell(`G${currentRow}`).font = { bold: true, size: 14 };
    sheet.getCell(`G${currentRow}`).numFmt = '"$"#,##0.00';
}

export async function generateAuditExcelBuffer(screens: any[], options?: AuditExcelOptions): Promise<Buffer> {
    const workbook = await generateAuditExcel(screens, options);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
}
