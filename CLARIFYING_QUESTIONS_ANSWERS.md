# Clarifying Questions - Answers & Decisions

**Date:** February 4, 2026  
**Status:** Decisions Made - Ready for Implementation

---

## 1. Digital Signature Provider Decision ✅

**Question:** DocuSign or HelloSign?

**Answer:** **DocuSign** (Industry Standard)

**Rationale:**
- **Stadium contracts are high-value, legally binding documents** - DocuSign is the industry standard for enterprise contracts
- **Better audit trail** - DocuSign provides more comprehensive legal evidence (IP, device fingerprinting, certificate of completion)
- **Enterprise features** - Better suited for 15-year audit trail requirements (PRD Section 8.1)
- **Client familiarity** - Most stadium clients already use DocuSign, reducing friction
- **Integration maturity** - More robust API, better error handling, webhook reliability

**Implementation Notes:**
- Use DocuSign API v2.1 (latest stable)
- Implement envelope workflow (send → sign → download)
- Store Certificate of Completion in Project Vault
- Log all events to SignatureAuditTrail table

**Action Required:**
- Request DocuSign API credentials (Sandbox for testing, Production for launch)
- Set up DocuSign Connected App in DocuSign Admin
- Configure webhook endpoints for status updates

---

## 2. Salesforce Credentials Status ⚠️

**Question:** Do we have Salesforce Connected App Client ID and Secret?

**Answer:** **NOT YET - NEED TO REQUEST NOW**

**Action Required (IMMEDIATE):**
1. **Request from IT/Salesforce Admin:**
   - Salesforce Connected App creation
   - OAuth 2.0 Client ID and Client Secret
   - Sandbox credentials for testing (Week 4)
   - Production credentials for launch (Week 6)

2. **Required Permissions:**
   - API access enabled
   - OAuth scopes: `api`, `refresh_token`, `offline_access`
   - Webhook URL whitelisting (for outbound messages)

3. **Timeline:**
   - **Week 2 (This Week):** Request credentials
   - **Week 3:** Receive sandbox credentials, test OAuth flow
   - **Week 4:** Begin integration development
   - **Week 6:** Production credentials ready

**Risk Mitigation:**
- If credentials delayed, we can mock Salesforce API calls for Week 4-5 development
- Use Postman/Insomnia to test webhook endpoints independently
- Document integration spec so backend can proceed in parallel

---

## 3. Blue Glow Export Gate Decision ✅

**Question:** Hard block or warning when Blue Glows remain?

**Answer:** **HARD GATE** (Block export if unverified AI fields exist)

**Rationale:**
- **PRD Section 3.2 & 6.5 mandate:** "Human verification is a non-negotiable gate before Approved/Exported state"
- **P0 Risk:** Unverified AI-extracted data could reach client in branded PDF (hallucinations in high-stakes bids)
- **Audit Trail Requirement:** 15-year audit trail requires verification records (PRD Section 8.1)
- **Trust but Verify:** Core principle - AI fills, human verifies, system enforces

**Implementation:**
- **API Level:** Block status transition to `APPROVED` if `aiFilledFields.length > verifiedFields.length`
- **UI Level:** Disable "Export PDF" button, show clear message: "Please verify all AI-extracted fields before exporting"
- **Error Response:** Return 403 Forbidden with list of unverified fields:
  ```json
  {
    "error": "Cannot approve proposal with unverified AI fields",
    "unverifiedFields": [
      { "field": "screens[0].pitchMm", "screen": "North Upper Display" },
      { "field": "screens[1].brightness", "screen": "South Lower Display" }
    ]
  }
  ```

**Exception Handling:**
- **Admin Override:** Admins can bypass gate (logged in audit trail)
- **Mirror Mode:** No gate (Excel imports are pre-verified by estimator)
- **Intelligence Mode Only:** Gate applies only when `calculationMode === "INTELLIGENCE"`

**User Experience:**
- Clear visual indicators (Blue Glow + verification checkmark)
- Progress indicator: "17/20 fields verified"
- Export button shows: "Verify 3 more fields to export"

---

## Summary of Decisions

| Question | Decision | Priority | Timeline |
|----------|----------|----------|----------|
| Digital Signature Provider | **DocuSign** | P0 | Week 7 |
| Salesforce Credentials | **Request Now** | P0 | Week 2 (this week) |
| Blue Glow Export Gate | **Hard Block** | P0 | Week 2 (immediate) |

---

## Next Actions

1. ✅ **This Week:** Implement Blue Glow persistence + hard gate (Phase 1 gap fix)
2. ✅ **This Week:** Enhance RAG prompt engineering (Phase 2.1.1)
3. ⚠️ **This Week:** Request Salesforce credentials from IT
4. ⚠️ **Week 3:** Request DocuSign API credentials
5. 🚀 **Week 4:** Begin Salesforce integration (if credentials ready)

---

**Status:** All decisions made, ready to proceed with implementation.
