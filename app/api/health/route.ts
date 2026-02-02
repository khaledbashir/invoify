export const runtime = "nodejs";
export const maxDuration = 10;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return await Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
		),
	]);
}

export async function GET() {
	const startedAt = Date.now();
	const details: any = {
		ok: true,
		version: "health.v1",
		timeMs: 0,
		db: { ok: false },
		browserless: { configured: false, ok: false },
	};

	try {
		await withTimeout(prisma.$queryRaw`SELECT 1`, 3000);
		details.db.ok = true;
	} catch (e) {
		details.ok = false;
		details.db.ok = false;
		details.db.error = e instanceof Error ? e.message : String(e);
	}

	const browserlessUrl = process.env.BROWSERLESS_URL;
	if (browserlessUrl) {
		details.browserless.configured = true;
		try {
			const puppeteer = (await import("puppeteer-core")).default;
			const browser = await withTimeout(
				puppeteer.connect({ browserWSEndpoint: browserlessUrl }),
				4000
			);
			await browser.disconnect();
			details.browserless.ok = true;
		} catch (e) {
			details.browserless.ok = false;
			details.browserless.error = e instanceof Error ? e.message : String(e);
		}
	}

	details.timeMs = Date.now() - startedAt;
	return NextResponse.json(details, { status: details.ok ? 200 : 503 });
}
