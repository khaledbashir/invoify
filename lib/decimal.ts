import Decimal from 'decimal.js';

// Configure Decimal.js globally for ANC rounding contract
// Reference: VERIFICATION_REFINED_DESIGN.md
Decimal.set({
    precision: 20,              // 20 decimal places for intermediate calculations
    rounding: Decimal.ROUND_HALF_EVEN,  // Banker's rounding (reduces systematic bias)
    toExpNeg: -7,               // Exponential notation threshold
    toExpPos: 21,
    maxE: 9e15,
    minE: -9e15,
    crypto: false,
    modulo: Decimal.ROUND_HALF_EVEN,
});

// Helper function for consistent rounding to cents (2 decimals)
export function roundToCents(value: Decimal | number | string): Decimal {
    const decimal = new Decimal(value);
    return decimal.toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
}

// Helper function for category totals with audit logging placeholder
// In a real implementation, this would connect to an audit service
export function roundCategoryTotal(value: Decimal | number | string, category: string): Decimal {
    const rounded = roundToCents(value);
    
    // In the future, we will hook this into the Audit Log system
    // console.log(`[Audit] Rounding ${category}: ${value} -> ${rounded}`);
    
    return rounded;
}

export default Decimal;
