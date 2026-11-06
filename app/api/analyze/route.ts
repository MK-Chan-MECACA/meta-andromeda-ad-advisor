import { generateText, Output } from "ai";
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
import { sql } from "@/lib/db";
import { modelFor } from "@/lib/entitlements";
import {
  handle,
  requireWorkspace,
  workspaceEntitlements,
} from "@/lib/workspace";

export const maxDuration = 120;

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

export const POST = handle(async (req: Request) => {
  const ws = await requireWorkspace();

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

  const ent = await workspaceEntitlements(ws.workspaceId);
  if (!ent.allowed) {
    return NextResponse.json(
      {
        error:
          ent.reason === "seats"
            ? `This workspace has more members than its ${ent.plan} plan allows (${ent.seats}). An admin can remove members or upgrade.`
            : `You've used all ${ent.quota} analyses for this period on the ${ent.plan} plan. Upgrade to continue.`,
        reason: ent.reason,
      },
      { status: 402 },
    );
  }

  const imageLabels = data.images.map(
    (img, i) =>
      `${img.kind === "screenshot" ? "Ads Manager screenshot" : "Creative"} ${i + 1}${img.name ? ` (${img.name})` : ""}`,
  );

  const userText = buildUserAnalysisPrompt({
    copy: data.copy,
    setup: data.setup,
    metrics: data.metrics,
    imageLabels,
  });

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; image: string }
  > = [{ type: "text", text: userText }];

  for (const image of data.images) {
    content.push({ type: "image", image: image.dataUrl });
  }

  try {
    // AI Gateway: plan model first, the other plan's model as fallback.
    const model = modelFor(ent.plan);
    const fallback = modelFor(ent.plan === "pro" ? "free" : "pro");
    const { output: object, usage, response } = await generateText({
      model,
      output: Output.object({ schema: analysisResultSchema }),
      instructions: ANDROMEDA_SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      temperature: 0.3,
      providerOptions: {
        gateway: { models: [fallback], user: ws.workspaceId, tags: [ent.plan] },
      },
    });

    // Only successful analyses are stored, so only they count toward quota.
    const [row] = await sql`
      insert into analyses (workspace_id, created_by, input, result, model, total_tokens, meta_ad_id)
      values (
        ${ws.workspaceId}, ${ws.userId},
        ${JSON.stringify({ copy: data.copy, setup: data.setup, metrics: data.metrics, imageLabels })},
        ${JSON.stringify(object)}, ${response.modelId},
        ${usage.totalTokens ?? null}, ${data.metaAdId ?? null}
      )
      returning id`;

    return NextResponse.json({ analysis: object, id: row.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Analysis failed unexpectedly.";
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 502 },
    );
  }
});
