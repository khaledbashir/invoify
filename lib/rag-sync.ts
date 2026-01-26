export async function syncDocumentsToAnythingLLM(docs: Array<{ name: string; content: string }>) {
  const url = process.env.ANYTHING_LLM_URL;
  const key = process.env.ANYTHING_LLM_KEY;
  if (!url || !key) throw new Error("AnythingLLM not configured (ANYTHING_LLM_URL / ANYTHING_LLM_KEY)");

  const endpoint = `${url.replace(/\/$/, "")}/v1/document/upload`;

  const results: any[] = [];

  for (const doc of docs) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: doc.name, content: doc.content }),
    });

    const text = await res.text();
    try {
      results.push({ ok: res.ok, body: JSON.parse(text) });
    } catch (e) {
      results.push({ ok: res.ok, bodyText: text });
    }
  }

  return results;
}

export async function vectorSearch(workspace: string, query: string) {
  const url = process.env.ANYTHING_LLM_URL;
  const key = process.env.ANYTHING_LLM_KEY;
  if (!url || !key) throw new Error("AnythingLLM not configured (ANYTHING_LLM_URL / ANYTHING_LLM_KEY)");

  const endpoint = `${url.replace(/\/$/, "")}/v1/workspace/${workspace}/vector-search`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text();
  try {
    return { ok: res.ok, body: JSON.parse(text) };
  } catch (e) {
    return { ok: res.ok, bodyText: text };
  }
}

export async function uploadLinkToWorkspace(workspace: string, urlLink: string) {
  const base = process.env.ANYTHING_LLM_URL;
  const key = process.env.ANYTHING_LLM_KEY;
  if (!base || !key) throw new Error("AnythingLLM not configured (ANYTHING_LLM_URL / ANYTHING_LLM_KEY)");

  const endpoint = `${base.replace(/\/$/, "")}/v1/workspace/${workspace}/document/upload-link`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: urlLink }),
  });

  const text = await res.text();
  try {
    return { ok: res.ok, body: JSON.parse(text) };
  } catch (e) {
    return { ok: res.ok, bodyText: text };
  }
}

