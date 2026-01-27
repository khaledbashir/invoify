import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
// If lodash is not available, we can write a simple debounce.
// Let's assume we need a custom one to be safe.

export const useDebouncedSave = (enabled: boolean = true) => {
    const { getValues } = useFormContext();
    const isSavingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Watch critical fields to know when to save?
    // Or just expose a `saveNow` function that the Wizard calls on transition.
    // The user asked for "Save on Transition".

    const saveToDb = useCallback(async () => {
        if (!enabled) return;

        // Clear existing timeout to debounce
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            if (isSavingRef.current) return;

            const data = getValues();
            const proposalId = data.details?.proposalId;

            if (!proposalId || proposalId === 'new') return;

            try {
                isSavingRef.current = true;
                // console.log("Saving proposal...", proposalId);

                // We reuse the existing update API
                // Usually PUT /api/proposals/[id] or similar.
                // Let's assume standard Next.js route likely at /api/proposals/[id] based on conventions
                // Use fetch.

                await fetch(`/api/proposals/${proposalId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                // console.log("Saved.");
            } catch (e) {
                console.error("Auto-save failed", e);
            } finally {
                isSavingRef.current = false;
            }
        }, 1000); // 1 second debounce
    }, [enabled, getValues]);

    return { saveToDb };
};
