import * as fs from 'fs';
import * as path from 'path';

// Polyfill for File/Blob if needed in Node environment (usually in Node 18+ global File is available, 
// but to be safe we can use Blob).
// If "File" is not defined, we might need a workaround, but let's try standard Globals first.

async function runValidation() {
    // 1. Load Env
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    // Remove quotes and whitespace
                    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                    process.env[key] = value;
                }
            });
            console.log("✅ Loaded .env file");
        }
    } catch (e) {
        console.error("Failed to load .env", e);
    }

    // 2. Dynamic Import (Crucial: Must happen AFTER env load)
    const { anythingLLMService } = await import("../services/AnythingLLMService");

    console.log("🚀 Starting AnythingLLM Validation Sequence...");

    const TIMESTAMP = Date.now();
    const WORKSPACE_NAME = `Validation-Test-${TIMESTAMP}`;

    // 3. Create Workspace
    console.log(`\n[Step 1] Creating Workspace: ${WORKSPACE_NAME}`);
    let workspaceSlug = "";
    try {
        const workspace = await anythingLLMService.createWorkspace(WORKSPACE_NAME);
        if (!workspace) {
            throw new Error("Workspace creation returned null/undefined.");
        }
        console.log("✅ Workspace Created:", workspace);
        workspaceSlug = workspace.slug;

        if (!workspaceSlug) {
            throw new Error("Workspace created but no slug returned.");
        }
    } catch (error) {
        console.error("❌ Step 1 Failed:", error);
        process.exit(1);
    }

    // 4. Update System Prompt
    console.log(`\n[Step 2] Updating System Prompt for slug: ${workspaceSlug}`);
    const NEW_PROMPT = `You are an ANC Senior Estimator. 
    Validation ID: ${TIMESTAMP}. 
    Ensure you output valid JSON only.`;

    try {
        const promptRes = await anythingLLMService.updateSystemPrompt(workspaceSlug, NEW_PROMPT);
        console.log("✅ System Prompt Updated:", promptRes);
    } catch (error) {
        console.error("❌ Step 2 Failed:", error);
        process.exit(1);
    }

    // 5. Upload Document
    console.log(`\n[Step 3] Uploading Test Document to workspace: ${workspaceSlug}`);
    const dummyContent = "This is a test document content for ANC Estimator Validation.";
    const fileName = `test_doc_${TIMESTAMP}.txt`;

    // Create a Blob representing the file
    const fileBlob = new Blob([dummyContent], { type: 'text/plain' });

    try {
        const uploadRes = await anythingLLMService.uploadFile(fileBlob as any, fileName, workspaceSlug);
        console.log("✅ Document Uploaded:", JSON.stringify(uploadRes, null, 2));
    } catch (error) {
        console.error("❌ Step 3 Failed:", error);
        process.exit(1);
    }

    console.log("\n✨ Validation Sequence Completed Successfully!");
}

runValidation().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
