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

export const maxDuration = 120;

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

export async function POST(req: Request) {
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
