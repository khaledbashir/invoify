# Overhaul "Bold" Template to "ANC Premium"

I will completely replace the current "Bold" template with the new "ANC Premium" design while strictly preserving the "Classic" template in [ProposalTemplate2.tsx](file:///root/natalia/invoify/app/components/templates/proposal-pdf/ProposalTemplate2.tsx).

## Technical Implementation Plan

### 1. Font Configuration
- Update [ProposalLayout.tsx](file:///root/natalia/invoify/app/components/templates/proposal-pdf/ProposalLayout.tsx) to include **Work Sans** weights **300 (Light)**, 400 (Regular), and 700 (Bold) from Google Fonts.
- Set the global font family to "Work Sans" specifically for the Premium template.

### 2. Template Logic Refactoring
- Modify [ProposalTemplate2.tsx](file:///root/natalia/invoify/app/components/templates/proposal-pdf/ProposalTemplate2.tsx) to handle template switching:
    - Derive `templateId` from `details.pdfTemplate`.
    - If `templateId === 4` (Bold), render the new **ANC Premium** layout.
    - If `templateId === 2` (Classic), render the existing **Classic** layout.
- Use a conditional rendering structure to ensure the "Classic" logic is isolated and untouched.

### 3. "ANC Premium" Design Implementation
- **Header Section**:
    - Implement a full-width solid background in **French Blue (#0A52EF)**.
    - Place the **Inverted White ANC Logo** on the left using `LogoSelectorServer`.
    - Aligned right: Document title (e.g., "SALES QUOTATION") in White, Uppercase, Work Sans Bold.
- **Pricing & Content**:
    - Use **Blue Opal Navy (#002C73)** for all item titles and prices (no black text).
    - Clean white background with no zebra striping for the pricing table.
    - Make the total price prominently large and extra bold (`text-2xl` or larger).
    - Apply **Work Sans Light (300)** for technical specs subtext.
- **Footer**:
    - Add a solid decorative bar at the very bottom in **Blue Opal Navy (#002C73)**.

### 4. UI/UX Updates
- Update [TemplateSelector.tsx](file:///root/natalia/invoify/app/components/proposal/form/TemplateSelector.tsx) to rename "ANC Bold" to **"ANC Premium"** and update its description.

## Verification
- Confirm that selecting "ANC Classic" still renders the original design perfectly.
- Confirm that selecting "ANC Premium" renders the new high-end design with correct fonts and colors.
- Verify that the PDF export pipeline correctly loads the new "Work Sans" weights.

Does this plan meet your requirements? I am ready to begin the implementation.