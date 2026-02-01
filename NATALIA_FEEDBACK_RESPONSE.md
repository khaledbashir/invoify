# Natalia Feedback Response Document
**Date:** February 1, 2026  
**Prepared by:** Ahmad (Dev Team)

---

## Summary of Recent Requests & Resolutions

### 1. ✅ SPECIFICATIONS TABLE - Remove Pixel Density & HDR Status
**Natalia's Feedback:** "Can we remove pixel density" / "Remove HDR status"  
**Status:** ✅ COMPLETED  
**What we did:** Removed both rows from the specifications table.

---

### 2. ✅ PROJECT CONSTRAINTS & SCHEDULE Section
**Natalia's Feedback:** Screenshot showed X marks over this entire section  
**Status:** ✅ COMPLETED  
**What we did:** Removed the entire "Project Constraints & Schedule" section including Venue Specifications and Site Logistics.

---

### 3. ✅ EXHIBIT B - Remove Description Column
**Natalia's Feedback:** "Remove middle column (just Name + Price)"  
**Status:** ✅ COMPLETED  
**What we did:** Exhibit B now shows only 2 columns: **Item Name** | **Price**

---

### 4. ✅ SIGNATURE BLOCK - Single Row
**Natalia's Feedback:** "Only ONE signature block (duplicate exists)"  
**Status:** ✅ COMPLETED  
**What we did:** Consolidated to a single signature row with ANC and Purchaser side-by-side.

---

### 5. ✅ PRICING - "Still only pulls up pricing from LED"
**Natalia's Feedback:** Excel import wasn't showing Structure, Install, Labor costs  
**Status:** ✅ COMPLETED  
**What we did:** Pricing section now includes ALL items from Excel:
- LED Display screens (with their sell price)
- Soft cost items (Structure, Install, Labor, PM, Travel, etc.)

---

### 6. 🔄 PRICING BREAKDOWN Toggle (In Progress)
**Natalia's Feedback:** "Can we remove the breakdown?" (referring to detailed line-item pricing)

**Our Recommendation:**

| Approach | Pros | Cons |
|----------|------|------|
| Auto-hide | "Magic", no clicks needed | Natalia has no control, unpredictable behavior |
| **Toggle** ✅ | Natalia decides per-proposal, transparent | One extra click |

**What we're implementing:**
- Adding a **"Show Pricing Breakdown"** toggle in the Export Config screen (Step 4)
- Same pattern as existing toggles for Constraints/Signatures
- **Default: ON** → Shows pricing detail (safe default)
- **Toggle OFF** → Hides breakdown for simple proposals
- **Transparent** → You know exactly what the PDF will contain

This approach is more professional because **you control the output**, not the system guessing.

---

### 7. ❓ TECH SPECIFICATIONS LISTED TWICE
**Natalia's Feedback:** "tech specifications are listed twice"  
**Status:** Needs verification  
**Possible cause:** If Exhibit A is somehow rendering alongside the main Specifications section. Exhibit A is NOT included in the current template - will verify.

---

### 8. ❓ LOGO DISAPPEARING
**Natalia's Feedback:** "Logo appears for a second then disappears"  
**Status:** Under investigation  
**Possible cause:** React hydration issue with Next.js Image component. May need to use static image approach for PDF rendering.

---

## Toggle Controls Summary (Export Config - Step 4)

| Toggle | Default | Purpose |
|--------|---------|---------|
| Show Pricing Breakdown | ✅ ON | Display detailed cost breakdown |
| Show Payment Terms | ✅ ON | Include payment schedule section |
| Show Signature Block | ✅ ON | Include signature area |
| Show Legal Text | ✅ ON | Include terms & conditions |

---

## Next Steps

1. ✅ Implement pricing breakdown toggle
2. Verify "specs listed twice" issue
3. Investigate logo disappearing bug
4. Test full PDF export flow

---

*This document will be updated as we address each item.*
