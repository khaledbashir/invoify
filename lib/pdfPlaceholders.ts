/**
 * PDF Placeholder Helpers
 * 
 * When values are missing, show template-style placeholders
 * instead of "Invalid Date" or "$0.00"
 */

import { formatNumberWithCommas } from "@/lib/helpers";
import { DATE_OPTIONS } from "@/lib/variables";

/**
 * Returns formatted date or placeholder if invalid/missing
 */
export function formatDateOrPlaceholder(dateValue: any, placeholder = "[DATE]"): string {
    if (!dateValue) return placeholder;

    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return placeholder;
        return date.toLocaleDateString("en-US", DATE_OPTIONS as Intl.DateTimeFormatOptions);
    } catch {
        return placeholder;
    }
}

/**
 * Returns formatted currency or placeholder if zero/missing
 */
export function formatAmountOrPlaceholder(amount: any, placeholder = "[AMOUNT]"): string {
    const num = Number(amount);
    if (!amount || isNaN(num) || num === 0) return placeholder;
    return `$${formatNumberWithCommas(num)}`;
}

/**
 * Returns value or placeholder if empty/missing
 */
export function valueOrPlaceholder(value: any, placeholder: string): string {
    if (!value || (typeof value === "string" && value.trim() === "")) {
        return placeholder;
    }
    return String(value);
}

/**
 * Default placeholders for common fields
 */
export const PLACEHOLDERS = {
    PROJECT_NAME: "[PROJECT NAME]",
    CLIENT_NAME: "[CLIENT NAME]",
    DATE: "[DATE]",
    AMOUNT: "[AMOUNT]",
    ADDRESS: "[ADDRESS]",
    CITY: "[CITY]",
    ZIP: "[ZIP]",
} as const;
