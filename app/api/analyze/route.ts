import { xai } from "@ai-sdk/xai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import {
  analyzeRequestSchema,
  analysisResultSchema,
  MAX_IMAGE_BYTES,
} from "@/lib/analysis-schema";
import {
  ANDROMEDA_SYSTEM_PROMPT,
  buildUserAnalysisPrompt,
} from "@/lib/andromeda-prompt";
import { clientIp, takeRateLimitToken } from "@/lib/rate-limit";

export const maxDuration = 120;

/** Cap aggregate decoded image bytes even when per-image limits are fine. */
const MAX_TOTAL_IMAGE_BYTES = 16 * 1024 * 1024;

const RATE_LIMIT = Number(process.env.ANALYZE_RATE_LIMIT_PER_MIN ?? "5");
const RATE_WINDOW_MS = 60_000;

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients still hit rate limits

  let requestOrigin: string;
  try {
    requestOrigin = new URL(req.url).origin;
  } catch {
    return false;
  }

  if (origin === requestOrigin) return true;

  const extras = (process.env.ANALYZE_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return extras.includes(origin);
}

export async function POST(req: Request) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const ip = clientIp(req);
  const limit = Number.isFinite(RATE_LIMIT) && RATE_LIMIT > 0 ? RATE_LIMIT : 5;
  const token = takeRateLimitToken(`analyze:${ip}`, limit, RATE_WINDOW_MS);
  if (!token.ok) {
    return NextResponse.json(
      {
        error: "Too many analyses from this IP. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(token.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const hasCopy = Object.values(data.copy).some((v) => v.trim().length > 0);
  const hasSetup = Object.values(data.setup).some((v) => v.trim().length > 0);
  const hasImages = data.images.length > 0;

  if (!hasCopy && !hasSetup && !hasImages) {
    return NextResponse.json(
      {
        error:
          "Provide at least ad copy, setup details, or an image/screenshot to analyze.",
      },
      { status: 400 },
    );
  }

  let totalImageBytes = 0;
  for (const image of data.images) {
    const bytes = estimateDataUrlBytes(image.dataUrl);
    if (bytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: `Image "${image.name ?? image.kind}" exceeds 4MB limit.`,
        },
        { status: 400 },
      );
    }
    totalImageBytes += bytes;
  }

  if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: `Total image payload exceeds ${MAX_TOTAL_IMAGE_BYTES / (1024 * 1024)}MB. Remove some creatives.`,
      },
      { status: 400 },
    );
  }

  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing XAI_API_KEY. Add it to .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  console.info(
    `[analyze] ip=${ip} images=${data.images.length} bytes=${totalImageBytes} mode=${data.mode} remaining=${token.remaining}`,
  );

  const creatives = data.images.filter((img) => img.kind === "creative");
  const imageLabels = data.images.map(
    (img, i) =>
      `${img.kind === "screenshot" ? "Ads Manager screenshot" : "Creative"} ${i + 1}${img.name ? ` (${img.name})` : ""}`,
  );

  const userText = buildUserAnalysisPrompt({
    mode: data.mode,
    copy: data.copy,
    setup: data.setup,
    metrics: data.metrics,
    signals: data.signals,
    imageLabels,
    creativeCount: creatives.length,
  });

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: string }
  > = [{ type: "text", text: userText }];

  for (const image of data.images) {
    content.push({ type: "image", image: image.dataUrl });
  }

  try {
    const { object } = await generateObject({
      model: xai.responses("grok-4.5"),
      schema: analysisResultSchema,
      system: ANDROMEDA_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.3,
    });

    return NextResponse.json({ analysis: object });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed unexpectedly.";
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: `Grok analysis failed: ${message}` },
      { status: 502 },
    );
  }
}
