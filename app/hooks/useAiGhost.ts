"use client";

import { useState, useCallback, useEffect } from 'react';

/**
 * AI Ghost Effect Hook
 * Creates a flickering French Blue highlight on fields when AI modifies them
 * 
 * Usage: const { highlightField, isFieldHighlighted } = useAiGhost();
 * Then: highlightField('fieldName', 2000) // highlights for 2 seconds
 */

export function useAiGhost() {
    const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

    const highlightField = useCallback((fieldName: string, duration: number = 2000) => {
        setHighlightedFields(prev => new Set([...prev, fieldName]));
        
        setTimeout(() => {
            setHighlightedFields(prev => {
                const next = new Set(prev);
                next.delete(fieldName);
                return next;
            });
        }, duration);
    }, []);

    const highlightMultipleFields = useCallback((fieldNames: string[], duration: number = 2000) => {
        setHighlightedFields(prev => new Set([...prev, ...fieldNames]));
        
        setTimeout(() => {
            setHighlightedFields(prev => {
                const next = new Set(prev);
                fieldNames.forEach(name => next.delete(name));
                return next;
            });
        }, duration);
    }, []);

    const isFieldHighlighted = useCallback((fieldName: string) => {
        return highlightedFields.has(fieldName);
    }, [highlightedFields]);

    const clearHighlights = useCallback(() => {
        setHighlightedFields(new Set());
    }, []);

    return {
        highlightedFields,
        highlightField,
        highlightMultipleFields,
        isFieldHighlighted,
        clearHighlights,
    };
}

/**
 * AI Ghost CSS Animation Classes
 * Add these to your global CSS or tailwind config
 */
export const aiGhostClasses = {
    base: "transition-all duration-300 ease-out",
    highlight: "ring-2 ring-[#0A52EF] ring-offset-2 ring-offset-zinc-950 shadow-[0_0_20px_rgba(10,82,239,0.5)] bg-[#0A52EF]/10",
    pulse: "animate-pulse",
};

/**
 * Get AI Ghost class names for a field
 */
export function getAiGhostClass(isHighlighted: boolean, baseClasses: string = ""): string {
    if (!isHighlighted) return baseClasses;
    
    return `${baseClasses} ${aiGhostClasses.base} ${aiGhostClasses.highlight} ${aiGhostClasses.pulse}`;
}
