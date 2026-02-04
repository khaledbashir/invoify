/**
 * Natalia's Excel Proposal Converter
 * Handles multiple Excel formats (Moody Center, Scotia Bank, etc.)
 * Converts to ANC Proposal Engine format with exact pricing preservation
 */

import * as XLSX from 'xlsx';

interface LineItem {
  description: string;
  cost: number;
  sellPrice: number;
  margin: number;
  category: 'led' | 'structure' | 'install' | 'electrical' | 'pm' | 'engineering' | 'warranty' | 'other';
}

interface ScreenLocation {
  name: string;
  description: string;
  pitchMm: number;
  quantity: number;
  heightFt: number;
  widthFt: number;
  areaSqFt: number;
  ledCost: number;
  ledSell: number;
}

interface NataliaProposal {
  clientName: string;
  projectName: string;
  locations: ScreenLocation[];
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
  currency: string;
}

/**
 * Detect Excel format type
 */
function detectFormat(workbook: XLSX.WorkBook): 'moody' | 'scotiabank' | 'unknown' {
  const sheets = workbook.SheetNames;
  
  if (sheets.includes('Bid Form') && sheets.includes('Summary')) {
    return 'moody';
  }
  
  if (sheets.includes('Margin Analysis (CAD)') || sheets.includes('LED Cost Sheet')) {
    return 'scotiabank';
  }
  
  return 'unknown';
}

/**
 * Parse Moody Center format
 */
function parseMoodyFormat(workbook: XLSX.WorkBook): NataliaProposal {
  const summarySheet = workbook.Sheets['Summary'];
  const data = XLSX.utils.sheet_to_json(summarySheet, { header: 1 }) as any[][];
  
  const projectName = String(data[2]?.[0] || 'Moody Center');
  const margin = parseFloat(data[3]?.[1]) || 0.25;
  
  const locations: ScreenLocation[] = [];
  const lineItems: LineItem[] = [];
  
  // Parse screen locations (rows 7-13)
  for (let i = 7; i <= 13; i++) {
    const row = data[i];
    if (!row[1] || String(row[1]).includes('Subtotal')) break;
    
    const description = String(row[1]);
    const pitchMatch = String(row[2]).match(/(\d+\.?\d*)/);
    const pitchMm = pitchMatch ? parseFloat(pitchMatch[1]) : 10;
    const quantity = parseInt(row[3]) || 1;
    const heightFt = parseFloat(row[4]) || 0;
    const widthFt = parseFloat(row[5]) || 0;
    const areaSqFt = parseFloat(row[6]) || 0;
    const unitCost = parseFloat(row[7]) || 0;
    const extCost = parseFloat(row[8]) || 0;
    const unitSell = parseFloat(row[10]) || 0;
    
    const locationName = description.split(':')[0].trim();
    
    locations.push({
      name: locationName,
      description,
      pitchMm,
      quantity,
      heightFt,
      widthFt,
      areaSqFt,
      ledCost: extCost,
      ledSell: unitSell * quantity
    });
  }
  
  // Calculate totals
  const totalLedCost = locations.reduce((sum, l) => sum + l.ledCost, 0);
  const totalLedSell = locations.reduce((sum, l) => sum + l.ledSell, 0);
  
  // Find grand total
  let grandTotal = 0;
  for (const row of data) {
    if (String(row[1]).includes('GRAND TOTALS')) {
      grandTotal = parseFloat(row[8]) || 0;
      break;
    }
  }
  
  return {
    clientName: 'LG',
    projectName,
    locations,
    lineItems,
    subtotal: totalLedSell,
    tax: 0,
    taxRate: 0,
    grandTotal,
    currency: 'USD'
  };
}

/**
 * Parse Scotia Bank format
 */
function parseScotiaBankFormat(workbook: XLSX.WorkBook): NataliaProposal {
  // Read Margin Analysis sheet for main pricing
  const marginSheet = workbook.Sheets['Margin Analysis (CAD)'];
  const marginData = XLSX.utils.sheet_to_json(marginSheet, { header: 1 }) as any[][];
  
  const projectName = String(marginData[1]?.[1] || 'Scotia Bank Arena');
  
  const locations: ScreenLocation[] = [];
  const lineItems: LineItem[] = [];
  
  // Parse G9 Ceiling LED Displays section (rows 6-15)
  // Note: Scotia Bank format has data in columns B-G (indices 1-6)
  for (let i = 6; i <= 15; i++) {
    const row = marginData[i];
    if (!row || !row[1]) continue;
    
    const description = String(row[1]);
    
    // Check if it's a display line
    if (description.includes('LED Video Displays') || description.includes('Ceiling LED')) {
      const cost = parseFloat(row[2]) || 0;
      const sellPrice = parseFloat(row[3]) || 0;
      const marginPct = parseFloat(row[5]) || 0.2;
      
      // Parse dimensions from description
      const dimMatch = description.match(/(\d+\.?\d*)m\s*h\s*x\s*(\d+\.?\d*)m\s*w/);
      const heightM = dimMatch ? parseFloat(dimMatch[1]) : 0;
      const widthM = dimMatch ? parseFloat(dimMatch[2]) : 0;
      const heightFt = heightM * 3.28084;
      const widthFt = widthM * 3.28084;
      const areaSqFt = heightFt * widthFt;
      
      // Parse pitch
      const pitchMatch = description.match(/(\d+\.?\d*)mm/);
      const pitchMm = pitchMatch ? parseFloat(pitchMatch[1]) : 2.5;
      
      // Parse quantity
      const qtyMatch = description.match(/\(Qty\s*(\d+)\)/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      
      const locationName = description.split('-')[0].trim();
      
      locations.push({
        name: locationName,
        description,
        pitchMm,
        quantity,
        heightFt,
        widthFt,
        areaSqFt,
        ledCost: cost,
        ledSell: sellPrice
      });
    }
    // Other line items (structure, install, etc.)
    else if (description.includes('Structural') || description.includes('Install') || 
             description.includes('Electrical') || description.includes('Project Management') ||
             description.includes('Warranty')) {
      const cost = parseFloat(row[2]) || 0;
      const sellPrice = parseFloat(row[3]) || 0;
      
      let category: LineItem['category'] = 'other';
      if (description.includes('Structural Materials')) category = 'structure';
      else if (description.includes('Install')) category = 'install';
      else if (description.includes('Electrical')) category = 'electrical';
      else if (description.includes('Project Management')) category = 'pm';
      else if (description.includes('Warranty')) category = 'warranty';
      
      lineItems.push({
        description,
        cost,
        sellPrice,
        margin: sellPrice - cost,
        category
      });
    }
  }
  
  // Find totals
  let subtotal = 0;
  let tax = 0;
  let taxRate = 0.13; // HST
  let grandTotal = 0;
  
  for (const row of marginData) {
    if (String(row[1]).includes('SUB TOTAL')) {
      subtotal = parseFloat(row[3]) || 0;
    }
    if (String(row[1]) === 'TAX') {
      taxRate = parseFloat(row[2]) || 0.13;
      tax = parseFloat(row[3]) || 0;
    }
  }
  
  grandTotal = subtotal + tax;
  
  return {
    clientName: 'Scotiabank Arena',
    projectName,
    locations,
    lineItems,
    subtotal,
    tax,
    taxRate,
    grandTotal,
    currency: 'CAD'
  };
}

/**
 * Main conversion function
 */
export function convertNataliaExcel(fileBuffer: Buffer): NataliaProposal {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const format = detectFormat(workbook);
  
  console.log(`[NataliaConverter] Detected format: ${format}`);
  
  switch (format) {
    case 'moody':
      return parseMoodyFormat(workbook);
    case 'scotiabank':
      return parseScotiaBankFormat(workbook);
    default:
      throw new Error(`Unknown Excel format. Sheets: ${workbook.SheetNames.join(', ')}`);
  }
}

/**
 * Generate ANC Proposal Engine compatible JSON
 */
export function generateANCProposal(nataliaProposal: NataliaProposal): any {
  return {
    receiver: {
      name: nataliaProposal.clientName,
      address: ''
    },
    details: {
      proposalName: nataliaProposal.projectName,
      venue: nataliaProposal.projectName,
      proposalDate: new Date().toISOString().split('T')[0],
    },
    screens: nataliaProposal.locations.map(loc => ({
      name: loc.name,
      description: loc.description,
      widthFt: loc.widthFt,
      heightFt: loc.heightFt,
      quantity: loc.quantity,
      pitchMm: loc.pitchMm,
      desiredMargin: 0.25,
      formFactor: 'Straight',
      serviceType: 'Front/Rear',
      // Preserve Natalia's exact pricing
      nataliaPricing: {
        ledCost: loc.ledCost,
        ledSell: loc.ledSell
      }
    })),
    lineItems: nataliaProposal.lineItems.map(item => ({
      description: item.description,
      cost: item.cost,
      sellPrice: item.sellPrice,
      category: item.category
    })),
    pricing: {
      subtotal: nataliaProposal.subtotal,
      tax: nataliaProposal.tax,
      taxRate: nataliaProposal.taxRate,
      grandTotal: nataliaProposal.grandTotal,
      currency: nataliaProposal.currency
    },
    source: 'natalia_excel_import'
  };
}

// CLI usage
if (require.main === module) {
  const fs = require('fs');
  const path = process.argv[2];
  
  if (!path) {
    console.error('Usage: npx tsx scripts/convert-natalia-excel.ts <path-to-excel>');
    process.exit(1);
  }
  
  const buffer = fs.readFileSync(path);
  const nataliaProposal = convertNataliaExcel(buffer);
  const ancProposal = generateANCProposal(nataliaProposal);
  
  console.log(JSON.stringify(ancProposal, null, 2));
}
