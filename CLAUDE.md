# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ANC Proposal Engine** (internally named "invoify") - A Next.js 15 enterprise proposal generator for LED display systems. Built for ANC Studio to create multi-million dollar proposals with AI-powered RFP extraction, dual calculation modes (Mirror/Intelligence), and mathematical verification systems.

## Key Technologies

- **Next.js 15** (App Router) with TypeScript 5.2.2
- **Prisma** with PostgreSQL (production) / SQLite (testing)
- **React 18.2** with Tailwind CSS 3.3.5
- **Puppeteer** for PDF generation (via Browserless in production)
- **AnythingLLM** for RAG-based RFP extraction
- **Package Manager**: pnpm (v10.28.2+)

## Development Commands

### Setup & Running
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build
pnpm start

# Linting
pnpm lint

# Bundle analysis
pnpm analyze
```

### Database Operations
```bash
# Generate Prisma client (runs automatically on install)
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Studio (database GUI)
npx prisma studio
```

### Testing & Scripts
```bash
# Run test scripts (must use npx tsx)
npx tsx scripts/test-rag-extraction.ts
npx tsx scripts/test-gap-fill-logic.ts
npx tsx scripts/test-webhook-direct.ts
npx tsx scripts/create-test-proposal.ts
npx tsx scripts/list-proposals.ts
npx tsx scripts/download-all-pdfs.ts

# Excel conversion scripts
npx tsx scripts/convert-natalia-excel.ts <file.xlsx>
npx tsx scripts/convert-standard-excel.ts <file.xlsx>
```

## Architecture

### Calculation Modes

**Mirror Mode**: Excel ingestion using FIXED column indices (no fuzzy matching). Rows starting with "ALT" or "Alternate" are skipped. Column mapping is hardcoded:
- Column A (0): Display Name
- Column E (4): Pixel Pitch
- Column M (12): Brightness
- See `invoify/services/proposal/server/excelImportService.ts:41-59`

**Intelligence Mode**: AI-powered RFP extraction using AnythingLLM RAG with Division 11 priority (Section 11 06 60 = Display Schedule master truth). See `invoify/lib/rag-sync.ts:38-48`.

### The "Natalia Math" (CRITICAL)

NEVER use `Cost * (1 + Margin)`. ALWAYS use the Divisor Margin formula:

```typescript
SellPrice = Cost / (1 - Margin)
Bond = SellPrice × 1.5%
BO_Tax = (SellPrice + Bond) × 2%
SalesTax = (SellPrice + Bond + BO_Tax) × 9.5%
FinalTotal = SellPrice + Bond + BO_Tax + SalesTax
```

Implementation: `invoify/lib/estimator.ts:427-436`

**Example**:
- Cost: $10,000, Margin: 25%
- ❌ WRONG (Markup): $10,000 × 1.25 = $12,500
- ✅ CORRECT (Divisor): $10,000 / 0.75 = $13,333.33

### Data Flow

1. **Server Component** (`app/projects/[id]/page.tsx`) fetches proposal from Prisma
2. **ProposalContext** (`contexts/ProposalContext.tsx`) manages global state
3. **Auto-save** via 2000ms debounce (see `lib/useAutoSave.ts`)
4. **Tri-directional sync**: Form ↔ AI Chat ↔ Excel Import all update ProposalContext

### Security: Share Link Sanitization

Client-facing share links MUST NEVER reveal internal costs/margins. Deep sanitization contract:

1. Deep clone proposal object
2. Set `cost: 0` for all line items
3. Set `margin: 0` for all line items
4. Set `bondRateOverride: undefined`
5. Save static JSON snapshot to `ProposalSnapshot` table
6. Share route reads ONLY the snapshot

Implementation: `app/api/projects/[id]/share/route.ts:27-120`

## Critical Files

### Core Logic
- `lib/estimator.ts` - Natalia Math implementation (Divisor Margin, Bond, Taxes)
- `lib/verification.ts` - Mathematical verification & gap detection
- `lib/schemas.ts` - Zod validation schemas
- `prisma/schema.prisma` - Database schema with Proposal lifecycle states

### Services
- `services/proposal/server/excelImportService.ts` - Mirror Mode Excel ingestion
- `services/rfp/server/extractionService.ts` - Intelligence Mode RFP extraction
- `services/pricing/server/pricingEngine.ts` - Product catalog pricing

### API Routes (Next.js App Router)
- `app/api/projects/[id]/route.ts` - CRUD operations
- `app/api/projects/[id]/share/route.ts` - Share link generation (with sanitization)
- `app/api/rag/extract/route.ts` - AnythingLLM RAG extraction
- `app/api/webhooks/docusign/route.ts` - DocuSign signature webhooks

## Deployment Workflow (CRITICAL)

**NO dev/staging environment** - All testing happens on production branch. Deployment rules:

1. Always push to GitHub repository after changes
2. Easypanel auto-deploy webhooks trigger builds on every push
3. Push to GitHub = deploy to production (no manual deployment needed)
4. Test before pushing - code must work first time
5. Never batch features - push after each logical change
6. Each commit must be deployable and not break production

See `.agent/rules/github.md` for complete deployment rules.

## Code Standards

### No Hardcoding
All client names ("Indiana Fever", "Chicago Fire") are samples. Use dynamic variables:
```tsx
// ❌ WRONG
<h1>Indiana Fever Proposal</h1>

// ✅ RIGHT
<h1>{proposal.clientName || 'New Project'}</h1>
```

### Nomenclature
- Use "Brightness" (not "Nits") in all client-facing text
- Variable names can be `brightnessNits` (internal only)
- Files updated: `services/proposal/server/excelImportService.ts:123`, `lib/gap-analysis.ts:77`, etc.

### Money Handling
- ALWAYS use `Decimal` type in Prisma (never `Float`)
- Use `roundToCents()` helper from `lib/math.ts`
- See schema: `prisma/schema.prisma` (all money fields are `Decimal`)

### PDF Generation
- Signature block MUST be absolute final element
- Footer renders BEFORE signatures (legal requirement)
- Implementation: `app/components/templates/proposal-pdf/ProposalTemplate2.tsx:363-424`

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL=postgresql://...         # Production DB
ANYTHING_LLM_URL=                     # RAG service URL
ANYTHING_LLM_KEY=                     # API key
ANYTHING_LLM_WORKSPACE=               # Workspace slug
BROWSERLESS_URL=                      # PDF generation service
SERPER_API_KEY=                       # Google search API
Z_AI_API_KEY=                         # OpenAI-compatible LLM key
Z_AI_BASE_URL=                        # LLM endpoint
Z_AI_MODEL_NAME=                      # Model identifier
```

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
```typescript
"@/*": ["./*"]  // All paths relative to invoify/
```

Example: `import { estimator } from "@/lib/estimator"`

## Database Schema Highlights

Key models in `prisma/schema.prisma`:

- **Workspace** - Multi-tenant support
- **Proposal** - Main proposal entity with lifecycle states (DRAFT → AUDIT → APPROVED → SIGNED → CLOSED)
- **ProposalSnapshot** - Immutable snapshots for share links (sanitized data)
- **ScreenConfig** - LED screen specifications
- **ManualOverride** - Audit trail for manual price adjustments
- **SignatureAuditTrail** - E-signature evidence (REQ-114)

Enums:
- `CalculationMode`: MIRROR | INTELLIGENCE
- `ProposalStatus`: DRAFT | AUDIT | APPROVED | SIGNED | CLOSED | ARCHIVED
- `VerificationStatus`: PENDING | VERIFIED | WARNING | ERROR | BLOCKED

## Testing Strategy

No formal test framework (Jest/Vitest). Testing via:

1. **Script-based tests** in `scripts/` directory (use `npx tsx`)
2. **Manual verification** via development server
3. **Production monitoring** (no staging environment)

When adding features:
- Create test script if complex logic
- Verify in dev server before pushing
- Monitor production after deployment

## Common Patterns

### Reading proposals
```typescript
// Server Component
const proposal = await prisma.proposal.findUnique({
  where: { id },
  include: { screens: { include: { lineItems: true } } }
});

// Client Component (via context)
const { proposal, updateProposal } = useProposalContext();
```

### Updating proposals
```typescript
// Auto-save is handled by useAutoSave hook
const { proposal, updateProposal } = useProposalContext();
updateProposal({ clientName: "New Name" }); // Debounced save
```

### Running calculations
```typescript
import { calculateProposalFinancials } from "@/lib/estimator";

const result = calculateProposalFinancials({
  screens: [...],
  taxRateOverride: 0.095,
  bondRateOverride: 0.015,
  calculationMode: "INTELLIGENCE"
});
```

## Documentation References

High-level design documents in `invoify/` root:
- `PROJECT_MASTER_TRUTH.md` - Architectural rules & verification checklist
- `ESTIMATOR_CONSTITUTION.md` - Core principles & "Natalia Math"
- `VERIFICATION_ARCHITECTURE.md` - Gap detection & auto-fix system
- `PHASE_ASSESSMENT_AND_ROADMAP.md` - Current status & roadmap

## Important Notes

1. **DO NOT** change Divisor Margin formula without explicit approval
2. **DO NOT** use fuzzy matching for Excel columns (use fixed indices)
3. **DO NOT** expose internal costs in client-facing exports
4. **ALWAYS** deep clone before sanitization in share links
5. **ALWAYS** verify share link sanitization after changes
6. **ALWAYS** test before pushing (no rollback mechanism)

## Common Issues

**Problem**: "Could not find Chrome" when generating PDFs locally
**Solution**: Set `BROWSERLESS_URL` in `.env` or use `DEPLOYED_APP_URL` for `download-all-pdfs.ts`

**Problem**: Prisma client not generated
**Solution**: Run `npx prisma generate` (should auto-run on `pnpm install`)

**Problem**: Database connection errors
**Solution**: Verify `DATABASE_URL` in `.env`. For local testing, switch to SQLite in schema.

**Problem**: Excel import returns empty data
**Solution**: Verify column indices match Natalia's template. Check `services/proposal/server/excelImportService.ts:41-59`.

---

**Last Updated**: 2026-02-05
**Maintained By**: ANC Development Team
**Source**: Auto-generated from codebase analysis
