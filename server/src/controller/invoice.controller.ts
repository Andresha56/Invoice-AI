import type { Request, Response } from "express";
import { llmService } from "../services/llmService.js";
import { invoiceEngine } from "../services/invoice.engine.js";
import type { GenerateInvoiceRequest } from "../types.js";

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const body = req.body as GenerateInvoiceRequest;
    if (!body.prompt?.trim()) {
      res.status(400).json({ success: false, error: "A valid invoice prompt is required." });
      return;
    }

    const entities = await llmService.extractEntities(body.prompt.trim());
    const missingDetails = invoiceEngine.checkMissingDetails(
      entities,
      Boolean(body.autoGenerateInvoiceMetadata),
      body.sellerProfile,
    );

    if (missingDetails.length) {
      res.json({
        success: false,
        requiresClarification: true,
        missingDetails,
        message: "Some invoice details are missing. Nothing was inferred or filled from external data.",
      });
      return;
    }

    const invoice = invoiceEngine.assembleInvoice(entities, body);
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("[POST /api/invoice/generate]", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong while creating your invoice. Please try again.",
    });
  }
};
