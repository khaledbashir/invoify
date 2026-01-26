import { NextRequest, NextResponse } from "next/server";

const ANYTHING_LLM_URL = process.env.ANYTHING_LLM_URL;
const ANYTHING_LLM_KEY = process.env.ANYTHING_LLM_KEY;
const ANYTHING_LLM_WORKSPACE = process.env.ANYTHING_LLM_WORKSPACE;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!ANYTHING_LLM_URL || !ANYTHING_LLM_KEY) {
      return NextResponse.json({ error: "LLM not configured" }, { status: 500 });
    }

    // System prompt instructing the model to output JSON actions when appropriate
    const systemPrompt = `You are the ANC Engine Controller. You have tools to modify the proposal. When the user asks for something, output a JSON object with the action. Available Actions: - { type: 'ADD_SCREEN', payload: { name, width, height, pitch, productType, quantity } } - { type: 'UPDATE_CLIENT', payload: { name, address } } - { type: 'SET_MARGIN', payload: { value } } If no action is needed, reply with plain text. When returning an action, output only the JSON object and nothing else.`;

    // We'll prefer workspace from env, else from request
    const workspace = body.workspace ?? ANYTHING_LLM_WORKSPACE;
    if (!workspace) {
      return NextResponse.json({ error: 'No workspace provided or configured' }, { status: 400 });
    }

    // Construct chat payload
    const chatPayload = { message };

    // base URL (assert present)
    const baseUrl = ANYTHING_LLM_URL!.replace(/\/$/, '');

    // Helper to POST to workspace chat
    const postToWorkspaceChat = async (wsSlug: string) => {
      const endpoint = `${baseUrl}/workspace/${wsSlug}/chat`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANYTHING_LLM_KEY}` },
        body: JSON.stringify(chatPayload),
      });
      const text = await r.text();
      // Try parse
      try {
        return { status: r.status, body: JSON.parse(text) };
      } catch (e) {
        return { status: r.status, bodyText: text };
      }
    };

    // Try chat; if workspace invalid, try to create it and retry
    let result = await postToWorkspaceChat(workspace);

    if (result.status === 400 && result.body && result.body.error && result.body.error.includes('not a valid workspace')) {
      // Create workspace
      const createEndpoint = `${ANYTHING_LLM_URL.replace(/\/$/, '')}/workspace/new`;
      const createRes = await fetch(createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANYTHING_LLM_KEY}` },
        body: JSON.stringify({ name: workspace, slug: workspace }),
      });
      const createText = await createRes.text();
      try {
        const created = JSON.parse(createText);
        const newSlug = created?.workspace?.slug;
        if (newSlug) {
          result = await postToWorkspaceChat(newSlug);
        }
      } catch (e) {
        // ignore
      }
    }

    // Return whatever we got
    if (result.body) return NextResponse.json({ ok: true, data: result.body }, { status: 200 });
    return NextResponse.json({ ok: true, text: result.bodyText ?? '' }, { status: 200 });
  } catch (error: any) {
    console.error("Command route error:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
