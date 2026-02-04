"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface AIFieldWrapperProps {
    children: React.ReactNode;
    isAIFilled: boolean;
    fieldName?: string;
    proposalId?: string;
    verifiedFields?: Record<string, any>;
    onVerify?: (fieldName: string) => void;
    className?: string;
}

/**
 * AIFieldWrapper - Blue Glow & Verification Component
 * 
 * Wraps form fields that were filled by AI (AnythingLLM).
 * Shows a 2px French Blue (#0A52EF) outer glow to indicate AI origin.
 * Provides a "Checkmark" icon that removes the glow when clicked.
 * 
 * REQ-126: Persists verification state to database for audit trail.
 * 
 * Usage:
 * <AIFieldWrapper 
 *   isAIFilled={aiFields.includes('pitch')} 
 *   fieldName="screens[0].pitchMm" 
 *   proposalId={proposalId}
 *   verifiedFields={verifiedFields}
 *   onVerify={handleVerify}
 * >
 *   <Input ... />
 * </AIFieldWrapper>
 */
export function AIFieldWrapper({
    children,
    isAIFilled,
    fieldName,
    proposalId,
    verifiedFields = {},
    onVerify,
    className = "",
}: AIFieldWrapperProps) {
    // Check if field is already verified (from database)
    const isVerifiedFromDB = fieldName ? !!verifiedFields[fieldName] : false;
    const [isVerified, setIsVerified] = useState(isVerifiedFromDB);

    // Update local state when verifiedFields prop changes
    useEffect(() => {
        if (fieldName && verifiedFields[fieldName]) {
            setIsVerified(true);
        }
    }, [fieldName, verifiedFields]);

    const handleVerify = async () => {
        if (!fieldName) return;

        setIsVerified(true);

        // Persist to database if proposalId provided
        if (proposalId) {
            try {
                const response = await fetch(`/api/proposals/${proposalId}/verify-field`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fieldPath: fieldName,
                        verifiedBy: "current-user", // TODO: Get from auth context
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error("Failed to verify field:", error);
                    setIsVerified(false); // Revert on error
                    return;
                }
            } catch (error) {
                console.error("Error verifying field:", error);
                setIsVerified(false); // Revert on error
                return;
            }
        }

        // Call parent callback
        if (onVerify) {
            onVerify(fieldName);
        }
    };

    // Don't show glow if not AI-filled or already verified
    const showGlow = isAIFilled && !isVerified;

    return (
        <div className={`relative ${className}`}>
            {/* The wrapped field with conditional glow */}
            <div
                className={`transition-all duration-300 ${showGlow
                        ? "ring-2 ring-[#0A52EF] ring-offset-1 rounded-lg shadow-[0_0_12px_rgba(10,82,239,0.3)]"
                        : ""
                    }`}
            >
                {children}
            </div>

            {/* Verification checkmark button */}
            {showGlow && (
                <button
                    type="button"
                    onClick={handleVerify}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#0A52EF] rounded-full flex items-center justify-center text-white hover:bg-[#0A52EF]/90 transition-colors shadow-md z-10"
                    title="Mark as verified"
                >
                    <Check className="w-3.5 h-3.5" />
                </button>
            )}

            {/* AI indicator label (optional) */}
            {showGlow && (
                <div className="absolute -bottom-5 left-0 text-[10px] font-medium text-[#0A52EF] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#0A52EF] rounded-full animate-pulse" />
                    AI-Extracted
                </div>
            )}
        </div>
    );
}

/**
 * Hook to track verified fields
 */
export function useAIFieldVerification(initialAIFields: string[] = []) {
    const [aiFields, setAIFields] = useState<string[]>(initialAIFields);
    const [verifiedFields, setVerifiedFields] = useState<string[]>([]);

    const markAsVerified = (fieldName: string) => {
        setVerifiedFields(prev => [...prev, fieldName]);
    };

    const isAIFilled = (fieldName: string) => aiFields.includes(fieldName);
    const isVerified = (fieldName: string) => verifiedFields.includes(fieldName);
    const showGlow = (fieldName: string) => isAIFilled(fieldName) && !isVerified(fieldName);

    return {
        aiFields,
        verifiedFields,
        markAsVerified,
        isAIFilled,
        isVerified,
        showGlow,
        setAIFields,
    };
}

export default AIFieldWrapper;
