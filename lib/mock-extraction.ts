/**
 * Mock RFP Extraction
 * 
 * Provides mock extraction results for testing without AnythingLLM.
 * Uses hardcoded text snippets to validate extraction logic.
 */

/**
 * Mock extraction for Jacksonville Jaguars RFP
 */
export function mockJacksonvilleExtraction(): any {
    const mockText = `SECTION 110660 - LED DISPLAY SYSTEMS SCHEDULE OF DISPLAYS. 1.2 SCHEDULE OF DISPLAYS. DESC: NE Low Head Height Entry. HT x WD: 13' - 6" x 24'. TYPE: SMD 4mm. USE: Live video, animations. POS INFO: Northeast Main Concourse. NOTES: REF. A434-03.2`;

    // Parse the mock text
    const nameMatch = mockText.match(/DESC:\s*([^.]+)/i);
    const dimensionsMatch = mockText.match(/HT x WD:\s*([^']+)/i);
    const pitchMatch = mockText.match(/TYPE:\s*SMD\s*(\d+)mm/i);
    const locationMatch = mockText.match(/POS INFO:\s*([^.]+)/i);

    const name = nameMatch ? nameMatch[1].trim() : null;
    const dimensions = dimensionsMatch ? dimensionsMatch[1].trim() : null;
    const pitch = pitchMatch ? parseInt(pitchMatch[1]) : null;
    const location = locationMatch ? locationMatch[1].trim() : null;

    // Parse dimensions (13' - 6" x 24')
    let heightFt = null;
    let widthFt = null;
    if (dimensions) {
        const dimParts = dimensions.split('x').map(d => d.trim());
        if (dimParts.length === 2) {
            // Parse "13' - 6"" format
            const heightMatch = dimParts[0].match(/(\d+)'\s*-\s*(\d+)"/);
            if (heightMatch) {
                heightFt = parseFloat(heightMatch[1]) + parseFloat(heightMatch[2]) / 12;
            }
            const widthMatch = dimParts[1].match(/(\d+)'/);
            if (widthMatch) {
                widthFt = parseFloat(widthMatch[1]);
            }
        }
    }

    return {
        extractionAccuracy: "High", // Section 11 06 60 found
        screens: name ? [{
            name: {
                value: name,
                citation: "[Source: Section 11 06 60, Page 1]",
                confidence: 0.98,
            },
            pixelPitch: pitch ? {
                value: pitch,
                citation: "[Source: Section 11 06 60, Page 1]",
                confidence: 0.95,
            } : null,
            width: widthFt ? {
                value: widthFt,
                citation: "[Source: Section 11 06 60, Page 1]",
                confidence: 0.95,
            } : null,
            height: heightFt ? {
                value: heightFt,
                citation: "[Source: Section 11 06 60, Page 1]",
                confidence: 0.95,
            } : null,
            location: location ? {
                value: location,
                citation: "[Source: Section 11 06 60, Page 1]",
                confidence: 0.90,
            } : null,
        }] : [],
        extractionSummary: {
            totalFields: 20,
            extractedFields: 17,
            completionRate: 0.85,
            highConfidenceFields: 15,
            lowConfidenceFields: 2,
            missingFields: ["serviceType", "brightness"],
        },
    };
}

/**
 * Mock extraction for WVU Coliseum RFP
 */
export function mockWVUExtraction(): any {
    const mockText = `SECTION 11 63 10.01 – COLISEUM LED DISPLAY SYSTEMS. c. Intent is for new center hung assembly, plus owner allowance items to achieve a total weight of not more than 60,000 lbs. Main Video Displays: 17' x 26', 6mm pitch.`;

    // Parse the mock text
    const weightMatch = mockText.match(/weight of not more than\s*([\d,]+)\s*lbs/i);
    const dimensionsMatch = mockText.match(/Main Video Displays:\s*(\d+)'\s*x\s*(\d+)'/i);
    const pitchMatch = mockText.match(/(\d+)mm\s*pitch/i);
    const nameMatch = mockText.match(/center hung assembly/i);

    const weight = weightMatch ? parseInt(weightMatch[1].replace(/,/g, '')) : null;
    const heightFt = dimensionsMatch ? parseFloat(dimensionsMatch[1]) : null;
    const widthFt = dimensionsMatch ? parseFloat(dimensionsMatch[2]) : null;
    const pitch = pitchMatch ? parseInt(pitchMatch[1]) : null;
    const name = nameMatch ? "Center Hung LED Assembly" : null;

    return {
        extractionAccuracy: "High", // Section 11 63 10.01 found
        screens: name ? [{
            name: {
                value: name,
                citation: "[Source: Section 11 63 10.01, Page 1]",
                confidence: 0.98,
            },
            pixelPitch: pitch ? {
                value: pitch,
                citation: "[Source: Section 11 63 10.01, Page 1]",
                confidence: 0.95,
            } : null,
            width: widthFt ? {
                value: widthFt,
                citation: "[Source: Section 11 63 10.01, Page 1]",
                confidence: 0.95,
            } : null,
            height: heightFt ? {
                value: heightFt,
                citation: "[Source: Section 11 63 10.01, Page 1]",
                confidence: 0.95,
            } : null,
        }] : [],
        rulesDetected: {
            weightLimit: weight ? {
                value: weight,
                citation: "[Source: Section 11 63 10.01, Page 1]",
                confidence: 0.95,
            } : null,
        },
        extractionSummary: {
            totalFields: 20,
            extractedFields: 17,
            completionRate: 0.85,
            highConfidenceFields: 15,
            lowConfidenceFields: 2,
            missingFields: ["serviceType", "brightness"],
        },
    };
}
