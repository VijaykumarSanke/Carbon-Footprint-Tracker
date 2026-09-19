import OpenAI from "openai";
import { env } from "../config/env.js";

const openai = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

export async function enrichAnalysis(summary) {
  if (!openai) {
    return {
      refinedCarbonValue: summary.carbonValue,
      explanation:
        "Rule-based estimation applied using travel, food, and electricity factors. Add an OpenAI API key for richer language refinement.",
      recommendations: null,
    };
  }

  try {
    const prompt = `You are EcoTrack AI. Refine a carbon estimate without changing it by more than 15%.
Return JSON with keys refinedCarbonValue, explanation, recommendations.
Summary: ${JSON.stringify(summary)}`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "eco_response",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              refinedCarbonValue: { type: "number" },
              explanation: { type: "string" },
              recommendations: {
                type: ["array", "null"],
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    text: { type: "string" },
                    impact: { type: "string" },
                    title: { type: "string" },
                    detail: { type: "string" },
                    reduction: { type: "number" },
                    difficulty: { type: "string" },
                  },
                  required: ["text", "impact", "title", "detail", "reduction", "difficulty"],
                },
              },
            },
            required: ["refinedCarbonValue", "explanation", "recommendations"],
          },
        },
      },
    });

    return JSON.parse(response.output_text);
  } catch (error) {
    console.warn("OpenAI enrichment failed, falling back to local reasoning.");
    console.warn(error.message);
    return {
      refinedCarbonValue: summary.carbonValue,
      explanation:
        "Rule-based estimation was used because AI enrichment could not be completed for this request.",
      recommendations: null,
    };
  }
}
