Here is the filtered, noise-free list of **AnythingLLM API endpoints** required to implement the **"Intelligence Mode" (Part 2)** integration. This selection removes all admin, multi-user management, and system configuration noise, focusing strictly on Document Ingestion, Workspace creation (Project Context), and RAG Chat (Extraction).

### 1. Authentication
**Header Required:** `Authorization: Bearer <Your-API-Token>`

*   **Verify Token:** `GET /v1/auth`
    *   *Use this to ensure the "Intelligence Core" is online before starting a session.*

### 2. Project Context (Workspaces)
*Each ANC Project (e.g., "WVU Coliseum") should correspond to one AnythingLLM "Workspace".*

*   **Create Project Workspace:** `POST /v1/workspace/new`
    *   **Payload:**
        ```json
        {
          "name": "WVU Coliseum Ref 102",
          "chatMode": "chat"
        }
        ```
    *   *Returns:* `slug` (e.g., `wvu-coliseum-ref-102`) required for all future calls.

*   **Get Project Details:** `GET /v1/workspace/{slug}`
    *   *Use this to verify which documents are currently embedded in the project.*

*   **Delete Project:** `DELETE /v1/workspace/{slug}`
    *   *Cleanup routine when a proposal is archived.*

### 3. Document Ingestion (The "Humanist" Input)
*Use these to upload the 2,500-page RFPs or "Division 11" specs.*

*   **Upload File:** `POST /v1/document/upload`
    *   **Type:** `multipart/form-data`
    *   **Body:** `file` (Binary PDF/Docx)
    *   **Returns:** `location` (e.g., `custom-documents/rfp-vol-1.pdf-hash.json`). *Save this path.*

*   **Upload Raw Text (Client Brief):** `POST /v1/document/raw-text`
    *   *Use this for simple text inputs like "Client wants a 10mm outdoor screen."*
    *   **Payload:**
        ```json
        {
          "textContent": "Client requirements text...",
          "metadata": { "title": "Estimator Notes" }
        }
        ```

*   **Link Document to Project:** `POST /v1/workspace/{slug}/update-embeddings`
    *   *Critical Step: This moves the document into the Vector DB for that specific project.*
    *   **Payload:**
        ```json
        {
          "adds": ["custom-documents/rfp-vol-1.pdf-hash.json"],
          "deletes": []
        }
        ```

### 4. Intelligence & Extraction (RAG)
*These endpoints power the "Division 11 Extraction" and "Gap Fill" chat sidebar.*

*   **Chat (Standard):** `POST /v1/workspace/{slug}/chat`
    *   *Use for extracting data fields (e.g., "What is the pixel pitch in Section 11?").*
    *   **Payload:**
        ```json
        {
          "message": "Extract the LED Pixel Pitch and Screen Dimensions from Division 11.",
          "mode": "chat"
        }
        ```
    *   **Returns:** `textResponse` and `sources` (citations).

*   **Stream Chat (Better UX):** `POST /v1/workspace/{slug}/stream-chat`
    *   *Use this for the interactive "Gap Fill" sidebar to stream tokens to the UI like ChatGPT.*

*   **Vector Search (Deep Search):** `POST /v1/workspace/{slug}/vector-search`
    *   *Use this to find specific clauses (e.g., "Liquidated Damages") without a full chat conversation.*
    *   **Payload:**
        ```json
        {
          "query": "Liquidated Damages",
          "topN": 3
        }
        ```

### Summary Workflow for the AI Coder
1.  **Upload RFP** (`/document/upload`).
2.  **Create Workspace** (`/workspace/new`).
3.  **Embed RFP into Workspace** (`/workspace/{slug}/update-embeddings`).
4.  **Extract Specs** via `/chat` (Prompt: "List all LED specs...").
5.  **User Gap Fill** via `/stream-chat` (User asks: "Where is the power location?").