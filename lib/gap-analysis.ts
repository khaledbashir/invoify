/**
 * analyzeGaps - Project Health & Completion Logic
 * Identifies missing fields in the proposal to drive completion rates.
 */

export type GapItem = {
    id: string;
    field: string;
    screenIndex?: number;
    priority: "high" | "medium" | "low";
    description: string;
};

export function analyzeGaps(formValues: any): GapItem[] {
    const gaps: GapItem[] = [];
    const screens = formValues?.details?.screens || [];

    // Check for Section 11 specific requirements (Division 11)
    if (formValues?.extractionAccuracy !== "High") {
        gaps.push({
            id: "division-11-missing",
            field: "Division 11 Data",
            priority: "medium",
            description: "Section 11 63 10 not detected. Manual verification required."
        });
    }

    // Check for missing screen information
    screens.forEach((screen: any, index: number) => {
        if (!screen.name || screen.name === "") {
            gaps.push({
                id: `screen-${index}-name`,
                field: "Screen Name",
                screenIndex: index,
                priority: "high",
                description: `Screen ${index + 1} needs a name`
            });
        }
        if (!screen.widthFt || screen.widthFt === 0) {
            gaps.push({
                id: `screen-${index}-width`,
                field: "Width",
                screenIndex: index,
                priority: "high",
                description: `Screen ${index + 1} missing width`
            });
        }
        if (!screen.heightFt || screen.heightFt === 0) {
            gaps.push({
                id: `screen-${index}-height`,
                field: "Height",
                screenIndex: index,
                priority: "high",
                description: `Screen ${index + 1} missing height`
            });
        }
        if (!screen.pitchMm || screen.pitchMm === 0) {
            gaps.push({
                id: `screen-${index}-pitch`,
                field: "Pitch",
                screenIndex: index,
                priority: "medium",
                description: `Screen ${index + 1} missing pitch`
            });
        }
    });

    // Check receiver info
    if (!formValues?.receiver?.name) {
        gaps.push({
            id: "receiver-name",
            field: "Client Name",
            priority: "high",
            description: "Client/Receiver name is missing"
        });
    }

    return gaps;
}

export function calculateCompletionRate(gapCount: number): number {
    // 20 fields total is the baseline for 100% completion
    return Math.max(0, Math.min(100, ((20 - gapCount) / 20) * 100));
}
