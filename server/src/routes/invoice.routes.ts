import { Router } from "express";
import { generateInvoice } from "../controller/invoice.controller.js";
import { getHealthCheck } from "../controller/health.controller.js";

const router = Router();
router.post("/generate", generateInvoice);
router.get("/health", getHealthCheck);
export default router;
