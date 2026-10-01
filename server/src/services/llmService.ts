import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import { INVOICE_EXTRACTION_PROMPT } from "../constant/prompt.js";
import type { ExtractedEntities } from "../types.js";
import { extractExplicitInvoiceHints, mergeExplicitInvoiceHints } from "./invoiceHints.js";

export interface LlmService {
  extractEntities(prompt: string): Promise<ExtractedEntities>;
}

const getClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenerativeAI(apiKey);
};

const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    invoice: {
      type: SchemaType.OBJECT,
      properties: {
        invoiceNumber: { type: SchemaType.STRING },
        invoiceDate: { type: SchemaType.STRING },
        dueDate: { type: SchemaType.STRING },
        dueDays: { type: SchemaType.NUMBER },
        paymentTerms: { type: SchemaType.STRING },
        currency: { type: SchemaType.STRING },
        currencySymbol: { type: SchemaType.STRING },
        notes: { type: SchemaType.STRING },
        termsAndConditions: { type: SchemaType.STRING },
      },
    },
    seller: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        address: { type: SchemaType.STRING },
        taxId: { type: SchemaType.STRING },
      },
    },
    client: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        companyName: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        address: { type: SchemaType.STRING },
        taxId: { type: SchemaType.STRING },
      },
    },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unit: { type: SchemaType.STRING },
          unitPrice: { type: SchemaType.NUMBER },
          totalPrice: { type: SchemaType.NUMBER },
          taxes: {
            type: SchemaType.ARRAY,
            description: "Every tax component explicitly stated for this line item. Rates can be any finite percentage, including decimals.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                label: { type: SchemaType.STRING },
                rate: { type: SchemaType.NUMBER },
                explicitlyZero: { type: SchemaType.BOOLEAN },
              },
              required: ["rate"],
            },
          },
          taxRate: { type: SchemaType.NUMBER },
          taxLabel: { type: SchemaType.STRING },
          taxExplicitlyZero: { type: SchemaType.BOOLEAN },
          discountPercentage: { type: SchemaType.NUMBER },
          discountAmount: { type: SchemaType.NUMBER },
          hsnSacCode: { type: SchemaType.STRING },
        },
        required: ["description", "taxes"],
      },
    },
    invoiceTax: {
      type: SchemaType.OBJECT,
      properties: {
        taxes: {
          type: SchemaType.ARRAY,
          description: "Invoice-level taxes that apply to every item. Preserve every explicitly supplied component.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING },
              rate: { type: SchemaType.NUMBER },
              explicitlyZero: { type: SchemaType.BOOLEAN },
            },
            required: ["rate"],
          },
        },
        rate: { type: SchemaType.NUMBER },
        label: { type: SchemaType.STRING },
        explicitlyZero: { type: SchemaType.BOOLEAN },
      },
    },
    discountPercentage: { type: SchemaType.NUMBER },
    discountAmount: { type: SchemaType.NUMBER },
  },
  required: ["invoice", "items"],
};

export const llmService: LlmService = {
  async extractEntities(prompt: string) {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0,
      },
    });

    let result;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        result = await model.generateContent([
          { text: INVOICE_EXTRACTION_PROMPT },
          { text: `USER REQUEST:\n${prompt}` },
        ]);
        break;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isTemporary = /503|service unavailable|high demand|temporar/i.test(message);
        if (!isTemporary || attempt === 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }

    if (!result) throw lastError instanceof Error ? lastError : new Error("Gemini request failed.");

    const raw = result.response.text()?.trim();
    if (!raw) throw new Error("Gemini returned an empty extraction response.");

    try {
      const extracted = JSON.parse(raw) as ExtractedEntities;
      return mergeExplicitInvoiceHints(extracted, extractExplicitInvoiceHints(prompt));
    } catch {
      throw new Error("Gemini returned invalid structured invoice data.");
    }
  },
};
