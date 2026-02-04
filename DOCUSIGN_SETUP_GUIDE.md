# DocuSign Integration Setup Guide

**Phase 2.3: Digital Signatures**  
**Status:** Code Complete - Awaiting Credentials

---

## Quick Start Checklist

- [ ] Install `jsonwebtoken` package
- [ ] Obtain DocuSign Developer Account credentials
- [ ] Configure environment variables
- [ ] Test envelope creation
- [ ] Configure webhook URL in DocuSign

---

## Step 1: Install Dependencies

```bash
cd invoify
npm install jsonwebtoken @types/jsonwebtoken
# OR if using pnpm:
pnpm add jsonwebtoken @types/jsonwebtoken
```

**Note:** The code uses `require()` for jsonwebtoken to avoid build-time errors, but the package must be installed for runtime functionality.

---

## Step 2: Obtain DocuSign Credentials

### 2.1 Create DocuSign Developer Account

1. Go to [https://developers.docusign.com](https://developers.docusign.com)
2. Sign up for a free developer account (or use existing account)
3. Navigate to **Admin** → **Apps and Keys** → **Integrations**

### 2.2 Create Integration (Connected App)

1. Click **"+ Add App and Integration Key"**
2. Name it: `ANC Studio Integration`
3. Select **"RSA"** for authentication
4. Click **"Generate RSA"** to create key pair
5. **Download the private key** (you'll need this for `DOCUSIGN_PRIVATE_KEY`)
6. Copy the **Integrator Key** (this is your `DOCUSIGN_INTEGRATOR_KEY`)

### 2.3 Get Account ID

1. Go to **Admin** → **Account** → **Account ID**
2. Copy the Account ID (this is your `DOCUSIGN_ACCOUNT_ID`)

### 2.4 Get User ID

- Your **User ID** is your DocuSign account email address (`DOCUSIGN_USER_ID`)

---

## Step 3: Configure Environment Variables

Copy `.env.example.docusign` to your `.env.local` file and fill in the values:

```bash
# DocuSign API Base URL
# Sandbox (for testing): https://demo.docusign.net
# Production: https://www.docusign.net
DOCUSIGN_BASE_URL=https://demo.docusign.net

# DocuSign Integrator Key (Client ID)
DOCUSIGN_INTEGRATOR_KEY=your-integrator-key-here

# DocuSign User ID (Email)
DOCUSIGN_USER_ID=your-email@example.com

# DocuSign RSA Private Key
# Format: PEM (-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----)
# Can be multiline or single-line with \n escape sequences
DOCUSIGN_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----

# DocuSign Account ID
DOCUSIGN_ACCOUNT_ID=your-account-id-here

# DocuSign Webhook Secret (Optional but recommended)
# Generate a random secret: openssl rand -hex 32
DOCUSIGN_WEBHOOK_SECRET=your-webhook-secret-here
```

### Private Key Format Options

**Option 1: Multiline (recommended for local development)**
```bash
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----"
```

**Option 2: Single-line with escape sequences**
```bash
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
```

---

## Step 4: Configure Webhook URL

### 4.1 Get Your Webhook URL

Your webhook endpoint is:
```
https://your-domain.com/api/webhooks/docusign
```

For local testing with ngrok:
```
https://your-ngrok-url.ngrok.io/api/webhooks/docusign
```

### 4.2 Configure in DocuSign

1. Go to **Admin** → **Connect** → **Event Notifications**
2. Click **"+ Add Configuration"**
3. Enter your webhook URL
4. Select events:
   - ✅ `envelope-sent`
   - ✅ `envelope-delivered`
   - ✅ `envelope-completed` (required)
   - ✅ `envelope-declined`
   - ✅ `envelope-voided`
5. Enable **"Include Envelope Data"**
6. Set **"Include Recipients"** to **"All"**
7. Enter your **Webhook Secret** (same as `DOCUSIGN_WEBHOOK_SECRET`)
8. Click **"Save"**

### 4.3 Verify Webhook

DocuSign will send a GET request to verify the URL. The endpoint automatically handles this.

---

## Step 5: Test Integration

### 5.1 Test Envelope Creation

```bash
# Using curl
curl -X POST http://localhost:3000/api/proposals/[proposal-id]/send-for-signature \
  -H "Content-Type: application/json" \
  -d '{
    "signers": [
      {
        "name": "Test Client",
        "email": "client@example.com",
        "role": "signer"
      }
    ]
  }'
```

### 5.2 Expected Response

```json
{
  "success": true,
  "envelopeId": "abc123-def456-...",
  "status": "sent",
  "message": "Proposal sent for signature"
}
```

### 5.3 Test Webhook (Local)

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
ngrok http 3000
# Copy the HTTPS URL and use it in DocuSign webhook configuration
```

---

## Step 6: Production Deployment

### 6.1 Switch to Production URL

Update `.env.local`:
```bash
DOCUSIGN_BASE_URL=https://www.docusign.net
```

### 6.2 Update Webhook URL

Update webhook configuration in DocuSign Admin to point to production URL.

### 6.3 Verify Environment Variables

Ensure all production environment variables are set in your hosting platform (Vercel, Railway, etc.).

---

## Troubleshooting

### Error: "jsonwebtoken package not installed"

**Solution:** Run `npm install jsonwebtoken @types/jsonwebtoken`

### Error: "DocuSign authentication failed"

**Possible Causes:**
1. Invalid Integrator Key
2. Invalid User ID (email)
3. Invalid Private Key format
4. Wrong Base URL (sandbox vs production)

**Solution:** Double-check all credentials match your DocuSign account.

### Error: "Invalid webhook signature"

**Solution:** Ensure `DOCUSIGN_WEBHOOK_SECRET` matches the secret configured in DocuSign Admin.

### Webhook Not Receiving Events

**Check:**
1. Webhook URL is publicly accessible (use ngrok for local testing)
2. Webhook is enabled in DocuSign Admin
3. Correct events are selected
4. Webhook secret matches

### Audit Trail Not Created

**Check:**
1. DocuSign service is properly configured (check logs)
2. Envelope status is "completed"
3. Recipients have status "signed"
4. Database connection is working

---

## API Endpoints

### Send for Signature

**POST** `/api/proposals/[id]/send-for-signature`

**Request Body:**
```json
{
  "signers": [
    {
      "name": "Client Name",
      "email": "client@example.com",
      "role": "signer"
    }
  ],
  "clientEmail": "client@example.com" // Fallback if signers not provided
}
```

**Response:**
```json
{
  "success": true,
  "envelopeId": "abc123...",
  "status": "sent",
  "message": "Proposal sent for signature"
}
```

### Webhook Endpoint

**POST** `/api/webhooks/docusign`

**GET** `/api/webhooks/docusign?challenge=xxx` (for webhook verification)

---

## Security Notes

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use environment variables** in production (not `.env` files)
3. **Enable webhook signature verification** in production
4. **Rotate secrets regularly** for production accounts
5. **Use sandbox** for testing before production deployment

---

## Next Steps

Once credentials are configured:

1. ✅ Test envelope creation with a sample proposal
2. ✅ Verify signature tabs appear correctly on PDF
3. ✅ Test webhook completion flow
4. ✅ Verify proposal locking works
5. ✅ Check audit trail records are created
6. ✅ Test with multiple signers
7. ✅ Verify document hash generation

---

## Support

For DocuSign API documentation:
- [DocuSign Developer Center](https://developers.docusign.com)
- [REST API Guide](https://developers.docusign.com/docs/esign-rest-api/)
- [Webhook Events](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/webhooks/)

For ANC Studio integration issues:
- Check logs: `console.log` statements in webhook handler
- Verify database: Check `SignatureAuditTrail` table
- Test service: Use `createDocuSignService()` to verify configuration
