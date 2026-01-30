/**
 * Canonical JSON Hash
 * Generates stable, hash-based comparison for long-term integrity
 * Replaces runtime deepEqual with hash-based comparison
 */

import Decimal from 'decimal.js';
import { createHash } from 'crypto';

// ============================================================================
// CANONICAL JSON STRINGIFY
// ============================================================================

/**
 * Canonical JSON stringify with recursive key sorting
 * Ensures consistent string representation regardless of insertion order
 */
export function canonicalJsonStringify(obj: any): string {
    return stableStringify(obj);
}

/**
 * Recursively stringify object with sorted keys
 */
function stableStringify(obj: any): string {
    // Handle null and undefined
    if (obj === null || obj === undefined) {
        return 'null';
    }
    
    // Handle primitives
    if (typeof obj !== 'object') {
        // Serialize Decimal as string
        if (obj instanceof Decimal) {
            return JSON.stringify(obj.toString());
        }
        return JSON.stringify(obj);
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        const elements = obj.map(stableStringify).join(',');
        return `[${elements}]`;
    }
    
    // Handle objects - sort keys recursively for deterministic ordering
    const sortedKeys = Object.keys(obj).sort();
    const properties = sortedKeys.map(key => {
        const value = stableStringify(obj[key]);
        return `${JSON.stringify(key)}:${value}`;
    });
    
    return `{${properties.join(',')}}`;
}

/**
 * Generate canonical SHA-256 hash
 * Use this for Layer 2 verification (PDF vs Ugly Sheet)
 */
export function canonicalJsonHash(obj: any): string {
    const canonical = canonicalJsonStringify(obj);
    return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * Compare two objects using canonical hash
 * Returns true if objects have identical structure and values
 */
export function canonicalHashEqual(obj1: any, obj2: any): boolean {
    const hash1 = canonicalJsonHash(obj1);
    const hash2 = canonicalJsonHash(obj2);
    return hash1 === hash2;
}

// ============================================================================
// SPECIALIZED HASH FUNCTIONS
// ============================================================================

/**
 * Generate hash for verification manifest
 * Used for Layer 2 verification (PDF vs Ugly Sheet snapshots)
 */
export function hashVerificationManifest(manifest: any): string {
    // Extract only the fields that matter for comparison
    const comparable = {
        proposalTotals: manifest.proposalTotals,
        perScreen: manifest.perScreen,
        reconciliation: manifest.reconciliation,
    };
    
    return canonicalJsonHash(comparable);
}

/**
 * Generate hash for proposal totals
 */
export function hashProposalTotals(totals: any): string {
    return canonicalJsonHash(totals);
}

/**
 * Generate hash for per-screen data
 */
export function hashPerScreenData(perScreen: any[]): string {
    return canonicalJsonHash(perScreen);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Create a hash from a string
 */
export function hashString(str: string): string {
    return createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * Create a hash from a buffer
 */
export function hashBuffer(buffer: Buffer): string {
    return createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
}

/**
 * Generate a short hash (first 8 characters of SHA-256)
 * Useful for display purposes
 */
export function shortHash(obj: any): string {
    return canonicalJsonHash(obj).substring(0, 8);
}

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

/**
 * Deep comparison using canonical hash
 * More reliable than deepEqual for complex objects
 */
export function deepEqualByHash(obj1: any, obj2: any): boolean {
    return canonicalHashEqual(obj1, obj2);
}

/**
 * Check if object has changed by comparing hashes
 * Useful for detecting changes in proposal data
 */
export function hasObjectChanged(original: any, current: any): boolean {
    const originalHash = canonicalJsonHash(original);
    const currentHash = canonicalJsonHash(current);
    return originalHash !== currentHash;
}

// ============================================================================
// EXPORTS
// ============================================================================

const CanonicalHash = {
    canonicalJsonStringify,
    canonicalJsonHash,
    canonicalHashEqual,
    hashVerificationManifest,
    hashProposalTotals,
    hashPerScreenData,
    hashString,
    hashBuffer,
    shortHash,
    deepEqualByHash,
    hasObjectChanged,
};

export default CanonicalHash;
