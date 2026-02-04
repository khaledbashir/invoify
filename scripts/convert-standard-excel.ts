/**
 * Standard Excel Proposal Converter
 * Handles 90% of Natalia's Excel files: Margin Analysis + LED Cost Sheet + Matrix
 * One-offs (Moody Center, LCD sheets, etc.) → manual import for now
 */

import * as XLSX from 'xlsx';

interface StandardProposal {
  clientName: string;
  projectName: string;
  screens: {
    name: string;
    pitchMm: number;
    quantity: number;
    heightM: number;
    widthM: number;
    areaSqM: number;
    ledCost: number;
    ledSell: number;
    margin: number;
  }[];
  lineItems: {
    description: string;
    cost: number;
    sell: number;
    category: string;
  }[];
  totals: {
    subtotal: number;
    tax: number;
    taxRate: number;
    grandTotal: number;
    currency: string;
  };
}

/**
 * Check if this is a standard format we can handle
 */
export function isStandardFormat(workbook: XLSX.WorkBook): boolean {
  const sheets = workbook.SheetNames;
  
  // Must have Margin Analysis sheet
  const hasMargin = sheets.some(s => s.includes('Margin Analysis'));
  
  // Should have LED Cost Sheet (optional but expected)
  const hasLedCost = sheets.some(s => s.includes('LED Cost'));
  
  return hasMargin;
}

/**
 * Parse standard format (Margin Analysis sheet)
 */
export function parseStandardExcel(fileBuffer: Buffer): StandardProposal {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  
  if (!isStandardFormat(workbook)) {
    throw new Error(
      'Non-standard Excel format. This converter handles:\n' +
      '- Margin Analysis + LED Cost Sheet (90% of proposals)\n' +
      '- One-offs (Moody Center, LCD sheets, etc.) → manual import for now'
    );
  }
  
  // Find Margin Analysis sheet (could be "Margin Analysis (CAD)" or "Margin Analysis (USD)")
  const marginSheetName = workbook.SheetNames.find(s => s.includes('Margin Analysis'));
  const marginSheet = workbook.Sheets[marginSheetName!];
  const data = XLSX.utils.sheet_to_json(marginSheet, { header: 1 }) as any[][];
  
  // Extract project info from row 2 (index 1)
  const projectInfo = String(data[1]?.[1] || '');
  const clientName = projectInfo.split('-')[0]?.trim() || 'Unknown Client';
  const projectName = projectInfo || 'Unknown Project';
  
  // Detect currency from sheet name
  const currency = marginSheetName?.includes('CAD') ? 'CAD' : 'USD';
  
  const screens: StandardProposal['screens'] = [];
  const lineItems: StandardProposal['lineItems'] = [];
  let subtotal = 0;
  
  // Parse rows starting from row 7 (index 6)
  // Note: xlsx library reads Scotia Bank format with data in column A (index 0)
  let currentSection = '';
  
  for (let i = 6; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;
    
    const colA = String(row[0] || '');
    const colB = String(row[1] || '');
    
    // Skip empty rows
    if (!colA && !colB) continue;
    
    // Section header (e.g., "G9 Ceiling LED Displays")
    if (colA && !colB && !colA.includes('mm') && !colA.includes('Cost')) {
      currentSection = colA;
      continue;
    }
    
    // LED Display line
    if (colA.includes('LED') && colA.includes('mm')) {
      const description = colA;
      const cost = parseFloat(row[1]) || 0;
      const sell = parseFloat(row[2]) || 0;
      const margin = parseFloat(row[4]) || 0;
      
      // Parse dimensions: "5.06m h x 5.40m w"
      const dimMatch = description.match(/(\d+\.?\d*)m\s*h\s*x\s*(\d+\.?\d*)m\s*w/);
      const heightM = dimMatch ? parseFloat(dimMatch[1]) : 0;
      const widthM = dimMatch ? parseFloat(dimMatch[2]) : 0;
      const areaSqM = heightM * widthM;
      
      // Parse pitch
      const pitchMatch = description.match(/(\d+\.?\d*)mm/);
      const pitchMm = pitchMatch ? parseFloat(pitchMatch[1]) : 2.5;
      
      // Parse quantity: "(Qty 2)"
      const qtyMatch = description.match(/\(Qty\s*(\d+)\)/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      
      // Extract location name
      const locationMatch = description.match(/^([^-:]+)/);
      const name = locationMatch ? locationMatch[1].trim() : `Screen ${screens.length + 1}`;
      
      screens.push({
        name,
        pitchMm,
        quantity,
        heightM,
        widthM,
        areaSqM,
        ledCost: cost,
        ledSell: sell,
        margin
      });
    }
    
    // Other line items (Structure, Install, etc.)
    else if (colA && (colA.includes('Structural') || colA.includes('Install') || 
                      colA.includes('Electrical') || colA.includes('Project Management') ||
                      colA.includes('Warranty') || colA.includes('Submittals'))) {
      const cost = parseFloat(row[1]) || 0;
      const sell = parseFloat(row[2]) || 0;
      
      let category = 'other';
      if (colA.includes('Structural')) category = 'structure';
      else if (colA.includes('Install')) category = 'install';
      else if (colA.includes('Electrical')) category = 'electrical';
      else if (colA.includes('Project Management')) category = 'pm';
      else if (colA.includes('Warranty')) category = 'warranty';
      else if (colA.includes('Submittals')) category = 'engineering';
      
      lineItems.push({
        description: colA,
        cost,
        sell,
        category
      });
    }
    
    // Totals
    else if (colA === 'SUB TOTAL (BID FORM)' || colA.includes('SUB TOTAL')) {
      // Capture subtotal from this row
      subtotal = parseFloat(row[2]) || parseFloat(row[3]) || 0;
    }
  }
  
  // Find totals in last few rows (using column A for Scotia Bank format)
  let tax = 0;
  let taxRate = currency === 'CAD' ? 0.13 : 0.095; // HST vs default
  let grandTotal = 0;
  
  for (let i = data.length - 10; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const colA = String(row[0] || '');
    
    if (colA === 'TAX' || colA === 'HST' || colA === 'GST') {
      taxRate = parseFloat(row[1]) || taxRate;
      tax = parseFloat(row[2]) || 0;
    }
    if (colA.includes('GRAND TOTAL') || (colA.includes('TOTAL') && !colA.includes('SUB'))) {
      grandTotal = parseFloat(row[2]) || parseFloat(row[3]) || 0;
    }
  }
  
  // If no grand total found, calculate
  if (grandTotal === 0 && subtotal > 0) {
    grandTotal = subtotal + tax;
  }
  
  return {
    clientName,
    projectName,
    screens,
    lineItems,
    totals: {
      subtotal,
      tax,
      taxRate,
      grandTotal,
      currency
    }
  };
}

/**
 * Generate ANC Proposal Engine JSON
 */
export function generateANCProposal(standard: StandardProposal): any {
  return {
    receiver: {
      name: standard.clientName,
      address: ''
    },
    details: {
      proposalName: standard.projectName,
      venue: standard.projectName,
      proposalDate: new Date().toISOString().split('T')[0],
    },
    screens: standard.screens.map(s => ({
      name: s.name,
      description: `${s.name} - ${s.heightM}m h x ${s.widthM}m w - ${s.pitchMm}mm (Qty ${s.quantity})`,
      widthFt: s.widthM * 3.28084,
      heightFt: s.heightM * 3.28084,
      quantity: s.quantity,
      pitchMm: s.pitchMm,
      desiredMargin: s.margin,
      formFactor: 'Straight',
      serviceType: 'Front/Rear',
      // Preserve exact pricing from Natalia's Excel
      nataliaPricing: {
        ledCost: s.ledCost,
        ledSell: s.ledSell
      }
    })),
    lineItems: standard.lineItems.map(item => ({
      description: item.description,
      cost: item.cost,
      sellPrice: item.sell,
      category: item.category
    })),
    pricing: {
      subtotal: standard.totals.subtotal,
      tax: standard.totals.tax,
      taxRate: standard.totals.taxRate,
      grandTotal: standard.totals.grandTotal,
      currency: standard.totals.currency
    },
    source: 'natalia_excel_import',
    importNotes: 'Standard format: Margin Analysis + LED Cost Sheet'
  };
}

// CLI usage
if (require.main === module) {
  const fs = require('fs');
  const path = process.argv[2];
  
  if (!path) {
    console.error('Usage: npx tsx scripts/convert-standard-excel.ts <path-to-excel>');
    console.error('');
    console.error('This converter handles standard format:');
    console.error('- Margin Analysis sheet (required)');
    console.error('- LED Cost Sheet (optional)');
    console.error('- Responsibility Matrix (optional)');
    console.error('');
    console.error('One-offs (Moody Center, LCD sheets, etc.) → manual import');
    process.exit(1);
  }
  
  try {
    const buffer = fs.readFileSync(path);
    const standard = parseStandardExcel(buffer);
    const ancProposal = generateANCProposal(standard);
    
    console.log(JSON.stringify(ancProposal, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
