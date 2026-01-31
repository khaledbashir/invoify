## Bug Analysis
The error `Uncaught TypeError: Cannot read properties of undefined (reading 'location')` is likely caused by unsafe property access in the `detectRisks` function. This function is called frequently in `ProposalContext.tsx` via a `watch` subscription, and if the form state is not fully initialized (especially on the `/projects/new` route), `data.details` might be undefined, leading to a crash when accessing `data.details.location`.

Additionally, the server logs indicate a Prisma schema mismatch where the column `taxRateOverride` is missing in the database, even though it exists in the Prisma schema.

## Proposed Changes

### 1. Fix Runtime Error in Risk Detector
- Add defensive checks to [risk-detector.ts](file:///root/natalia/invoify/services/risk-detector.ts) to safely handle cases where `data` or `data.details` might be undefined.
- Specifically, update the WTC location check and screen iteration to use optional chaining or default objects.

### 2. Strengthen Proposal Context
- Add defensive checks in [ProposalContext.tsx](file:///root/natalia/invoify/contexts/ProposalContext.tsx) when calling `detectRisks` and when accessing `getValues().details`.

### 3. Database Synchronization Instructions
- Provide a clear set of steps for the user to resolve the Prisma column mismatch. Since the environment seems to be a managed PaaS (Easypanel), the standard `prisma db push` might not be enough if the built app is using a stale Prisma Client or a different database connection.

## Implementation Steps

### Step 1: Update `detectRisks`
```typescript
// services/risk-detector.ts
export function detectRisks(data: ProposalType, rulesDetected?: any): RiskItem[] {
    const risks: RiskItem[] = [];
    if (!data || !data.details) return risks; // Defensive check

    // ...
    if (rulesDetected?.isWtcLocation || (data.details?.location || "").toLowerCase().includes("world trade")) {
    // ...
    const screens = data.details?.screens || [];
    // ...
}
```

### Step 2: Update `ProposalContext`
```typescript
// contexts/ProposalContext.tsx
// Around line 334
const currentValues = getValues();
if (currentValues && currentValues.details) {
    const detected = detectRisks(currentValues, rulesDetected);
    // ...
}
```

### Step 3: Database Sync (User Action Required)
I will recommend the user to perform the following in their Easypanel terminal:
1. `npx prisma db push --force` (to ensure the schema is applied)
2. `npx prisma generate` (to update the client)
3. Restart the application service.

**Confirmation Required**: Should I proceed with the code fixes for the runtime error?
