## Honest Assessment (What You Have Now)
- The current system is **close** to the right architecture (server import → normalized proposal model → live preview from that model), but the *actual* “edit Excel → PDF preview” sync is **not reliable**, meaning it’s **not production-ready** for a workflow where users trust edits.
- Your “PDF preview” is not a PDF renderer right now. It’s an **HTML proposal template preview** driven by `react-hook-form` watch, and the exported PDF is generated later via Puppeteer. That mismatch is fine *if* the data model is correct, but right now the data sync is the weak link.

## Root Causes (Why Sync Feels Broken)
- **Edits write to the wrong fields**: Excel editing currently writes `details.screens[i].height` / `.width`, but the schema (and templates) use `heightFt` / `widthFt`. Because `heightFt` already exists after import, templates prefer it (`heightFt ?? height`). So edits can appear to “do nothing”.
  - Sources: [schemas.ts](file:///root/natalia/invoify/lib/schemas.ts#L238-L264), [ProposalContext.tsx](file:///root/natalia/invoify/contexts/ProposalContext.tsx#L1766-L1791), [ProposalTemplate2.tsx](file:///root/natalia/invoify/app/components/templates/proposal-pdf/ProposalTemplate2.tsx#L90-L114)
- **Row → screen mapping is brittle**: `screenIndex = row - headerRowIndex - 1` breaks as soon as the import filters/reorders screens. That means you can edit row N and silently update the *wrong* screen.
  - Source: [ProposalContext.tsx](file:///root/natalia/invoify/contexts/ProposalContext.tsx#L1759-L1764)
- **ALT row detection differs client vs server**: client treats any row containing “ALT” as alternate (substring match), server only skips rows that *start with* ALT/Alternate. This creates disagreement between what was imported and what the user sees/edits.
  - Sources: [excelImportService.ts](file:///root/natalia/invoify/services/proposal/server/excelImportService.ts#L202-L208), [ProposalContext.tsx](file:///root/natalia/invoify/contexts/ProposalContext.tsx#L1655-L1661), [ExcelViewer.tsx](file:///root/natalia/invoify/app/components/ExcelViewer.tsx#L225-L231)
- **Stale-state risk in `updateExcelCell()`**: it updates `excelPreview` via `setExcelPreview(prev => ...)` but then reads `excelPreview` from an outer closure for mapping. Under fast edits, this can use stale sheet/header data.
  - Source: [ProposalContext.tsx](file:///root/natalia/invoify/contexts/ProposalContext.tsx#L1717-L1753)

## Assessment of Your Suggested Library Options (Super Straight)
### AG Grid + @react-pdf/renderer
- **AG Grid**: strong upgrade for “Excel-like editing” (copy/paste, selection, keyboard nav). Good fit.
- **@react-pdf/renderer**: *not* a drop-in for you. You currently generate production PDFs via **Puppeteer+HTML** and preview via the same HTML template. Moving to react-pdf means **rewriting templates** and accepting a different layout engine with different styling constraints.
- Verdict: **AG Grid yes; react-pdf no (for this codebase)** unless you’re okay rewriting templates and losing HTML/CSS parity.

### Handsontable
- Best “feels like Excel” UX, but commercial licensing. Also still doesn’t solve your core issue unless you fix the canonical data model + mapping.
- Verdict: viable if you want the UX and will pay; still requires fixing mapping/invariants.

### Syncfusion Spreadsheet
- Only option here that approximates a real Excel engine (formulas, formatting, real import/export). Heavy + paid + vendor lock.
- Verdict: choose this only if your *product requirement* is “edit actual workbook like Excel and export it” (not just edit proposal inputs).

### Wijmo
- Paid. Similar story: grid improvements don’t solve integrity unless you fix canonical state.

## What Actually Gets You Production-Ready (Unhideable-by-design)
- Single source of truth must be the **normalized proposal model** (`details.screens`, etc.).
- Excel is an **input artifact**, not the truth.
- Every edit must be traceable (screen ID / source row), validated, and any mismatch must be surfaced to the user (not silently ignored).

## Plan (Systematic Fix, No Hacks)
1. **Fix field contract for edits**
   - Update Excel edit mapping to write to `widthFt`, `heightFt`, `pitchMm`, etc. (the schema fields), not `width/height`.
2. **Make row→screen mapping deterministic and safe**
   - Extend imported screens with a stable `sourceRef` (sheet name + row index or a manifest key).
   - Build a mapping table: `sheetRowRef -> screenId` so edits can target the correct screen even if filtering/reordering happens.
   - If mapping fails, show a clear error and block the edit (no silent failure).
3. **Unify ALT/Alternate handling**
   - Make client preview use the same “startsWith ALT/Alternate after normalization” rule as the server.
4. **Remove stale-state reads in `updateExcelCell()`**
   - Derive LED sheet + header row from the same state snapshot used to update the grid (or compute from `prev`).
5. **Upgrade the “Excel-looking editor” without pretending to be Excel**
   - Keep the raw workbook viewer as read-only (optional), and introduce an **AG Grid-based Screen Editor** that edits `details.screens` directly.
   - This yields Excel-like UX where it matters (the user-editable proposal inputs), without the complexity of a full spreadsheet engine.
6. **Optional: True PDF preview mode**
   - Add a toggle: “Fast HTML preview” (current) vs “Exact PDF preview” (debounced server PDF generation + iframe preview) so what users see matches export pixel-for-pixel.

If you confirm this plan, I’ll implement it in that order and verify by reproducing the current desync and proving it’s gone.