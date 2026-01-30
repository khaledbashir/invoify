# Smart Ingest Pipeline Plan

## Problem
RFP documents (e.g., 2,500 pages) contain 90% "noise" (legal boilerplate, general conditions) and only 10% "signal" (pricing schedules, technical specs, drawings).
Embedding the entire document into AnythingLLM:
1.  Dilutes the context, leading to hallucinations.
2.  Slows down retrieval.
3.  Wastes vector storage.

## Solution: "Filter-Then-Embed" Architecture

We will implement a pre-processing layer that sits between the **Upload** and the **Embedding**.

### 1. The Pipeline

```mermaid
graph TD
    A[RFP PDF Upload] --> B{Smart Filter}
    B -->|Text Extraction| C[Page Classifier]
    C -->|Score > Threshold| D[High-Value Pages]
    C -->|Score < Threshold| E[Discard/Archive]
    D --> F[AnythingLLM Embedding]
    
    B -->|Image Analysis| G[Drawing Detector]
    G -->|Blueprints Found| H[Vision API (Z AI)]
    H --> I[Structured JSON]
    I --> F
```

### 2. Page Classification Logic (Heuristics)

We will score each page based on the presence of "Signal Keywords":
*   **High Value (+10):** "Schedule", "Pricing", "Bid Form", "Display", "LED", "Specification", "Technical", "Qty", "Quantity", "Pixel Pitch".
*   **Medium Value (+5):** "Section 11", "Division 27", "Scope of Work".
*   **Noise Indicators (-5):** "Indemnification", "Insurance", "Liability", "Termination", "Arbitration".

**Threshold:** Only pages with a score > 5 (configurable) are sent to the LLM.

### 3. Vision Integration
*   Pages with **low text density** but **high vector graphic content** (detected via PDF metadata or image analysis) are flagged as "Drawings".
*   These are sent to the `drawing-service.ts` (Z AI GLM-4.6v) for extraction.
*   The *text output* of the vision model is then embedded, making the drawing "searchable".

### 4. Implementation Steps
1.  **Install `pdf-parse`** for lightweight server-side text extraction.
2.  **Create `services/ingest/smart-filter.ts`**:
    *   `extractText(buffer)`
    *   `scorePage(text)`
    *   `detectDrawings(page)`
3.  **Modify `app/api/rfp/upload/route.ts`**:
    *   Intercept the file.
    *   Run `SmartFilter`.
    *   Upload *only* the filtered text (as a synthetic `.txt` or `.md` file) to AnythingLLM.
    *   (Original PDF is still saved to Vault for compliance/archival, but not embedded).

## User Benefits
*   **Accuracy:** RAG answers focus on specs, not legal terms.
*   **Speed:** Much faster processing.
*   **Cost:** "Free shit" (using Z AI for vision, efficient embedding).
