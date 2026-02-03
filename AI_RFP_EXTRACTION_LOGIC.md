# AI & RFP Extraction Logic (Intelligence Mode)

**Strict backend specification.** No design/branding noise. This is how the AI must handle "Humanist Documents" (2,500+ page RFPs) to extract Equipment (EQ) and Quantities.

---

## 1. The "Needle in the Haystack" Strategy (Filtering)

The AI cannot read a 2,500-page construction PDF linearly. It must **identify and isolate** the specific pages relevant to ANC first — to save context window space and reduce hallucinations.

### Filter Logic (Keywords to Hunt)

| Category | Keywords / Phrases |
|----------|--------------------|
| **Primary (LED Specs)** | `Division 11`, `Section 11 06 60` (LED Display Schedule), `Section 11 63 10` (LED Display Systems) |
| **Secondary (Scope & Price)** | `Exhibit B`, `Cost Schedule`, `Exhibit A` (Statement of Work / SOW), `Division 26` (Electrical / Sports Lighting), `Division 27` (Audio / Communications) |
| **Structural (Steel)** | `Thornton Tomasetti`, `TTE` (abbreviation) |

Only these high-signal pages are embedded and sent to the RAG engine. The rest are discarded.

---

## 2. The Extraction Targets (The "17/20" Rule)

Once pages are isolated, the RAG engine must extract these data points. The PRD calls this the **17/20 Rule** (aiming for 85% auto-fill).

### The "EQ" (Equipment) Fields to Extract

1. **Screen Name** (e.g. "South End Zone Main Video")
2. **Quantity** (e.g. "1", "4")
3. **Location/Zone** (e.g. "Northeast Main Concourse")
4. **Application** (Indoor vs. Outdoor)
5. **Pixel Pitch** (e.g. "10mm", "6mm")
6. **Resolution Height** (Pixels)
7. **Resolution Width** (Pixels)
8. **Active Area Height** (Feet/Inches)
9. **Active Area Width** (Feet/Inches)
10. **Brightness** (Capture value in Nits; **label** as "Brightness")
11. **Service Type** (Front vs. Rear access)
12. **Structural Tonnage** (Look for "tons" in Thornton Tomasetti reports)

Plus project-level: Client/Receiver name, Proposal name, Venue, and any other rules (e.g. spare parts, union labor) as specified elsewhere.

---

## 2.5 NOISE REDUCTION RULE (Critical - Natalia Annotation)

The AI MUST apply "Noise Reduction" for client-facing PDF output. Some technical fields extracted from RFPs are **INTERNAL-ONLY** and must NOT appear in the client-facing Specification Table.

### Internal-Only Fields (Do NOT map to PDF)

| Field | Rule |
|-------|------|
| **Pixel Density** | Extract for internal use but NEVER display in client PDF (e.g., "929.00 pixels/sq.ft"). Source: Natalia annotation: "remove dencity" |
| **HDR Status** | Extract for internal use but NEVER display in client PDF. Source: Natalia annotation: "remove HDRHDR Status" |

### Implementation

- **Extraction Phase:** AI may still extract these fields (flag them as `internalOnly: true`)
- **Output Phase:** When mapping to the PDF Specification Table, skip any field marked `internalOnly`
- **Reasoning:** These technical details (e.g., pixel density, HDR support) clutter the client proposal and are NOT required for client decision-making

---

## 3. The "Gap Fill" Logic (When AI Fails)

If the AI extracts 17 fields but misses 3 (e.g. it finds size but not **Service Type**), it must **NOT** guess.

- **Logic:** `If (field == null)` → Trigger **Gap Fill**.
- **Action:** The AI Chat Sidebar must actively prompt the user, e.g.:
  > *"I found the dimensions for the Center Hung, but Section 11 did not specify **Service Type**. Is this Front or Rear Service?"*

The user’s answer is then written back to the proposal and the field is marked verified.

---

## 4. Handling Drawings (OCR / Vision)

Jeremy (Estimator) needs to find drawings to verify physical constraints. The AI cannot "read" blueprints like an engineer; it uses OCR to find the right sheets.

- **Target:** Scan the PDF for sheet labels (typically in bottom corners).
- **Keywords:** `AV` (Audio-Visual), `A` (Architectural).
- **Goal:** Extract only pages labeled e.g. `AV-101`, `A-401`, and present them to the user for **manual verification** of steel attachment points.

No geometry interpretation — find the page, surface it for human review.

---

## 5. Citations (Trust But Verify)

Every extracted data point must have a citation so it can be verified as non-hallucinated.

- **Format:** `[Source: Section 11 06 60, Page 9]`
- **Why:** So Jeremy (or any user) can go to the original specification and confirm the number is real.

Citations are stored with the value and shown in the UI (e.g. Blue Glow tooltip, Sources section in the Intelligence Sidebar).
