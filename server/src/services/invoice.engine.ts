import type {
  ExtractedEntities,
  GenerateInvoiceRequest,
  Invoice,
  InvoiceAddons,
  InvoiceItem,
  MissingFieldInfo,
  SellerProfile,
} from "../types.js";

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  JPY: "¥",
  CNY: "¥",
  HKD: "HK$",
  NZD: "NZ$",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  ZAR: "R",
  BRL: "R$",
  MXN: "MX$",
  KRW: "₩",
  THB: "฿",
  MYR: "RM",
  IDR: "Rp",
  PHP: "₱",
  NGN: "₦",
  TRY: "₺",
  PLN: "zł",
  RUB: "₽",
};

const isFinitePositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isFiniteNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const missing = (
  field: string,
  label: string,
  message: string,
  quickSuggestions: string[] = [],
): MissingFieldInfo => ({ field, label, message, quickSuggestions });

export const checkMissingDetails = (
  entities: ExtractedEntities,
  autoGenerateInvoiceMetadata: boolean,
  sellerProfile?: SellerProfile,
): MissingFieldInfo[] => {
  const result: MissingFieldInfo[] = [];
  const invoice = entities.invoice ?? {};

  if (!entities.client?.name?.trim() && !entities.client?.companyName?.trim()) {
    result.push(
      missing(
        "client",
        "Client / customer",
        "Tell me who this invoice is for.",
        ["for ABC Ltd"],
      ),
    );
  }

  if (!entities.items.length) {
    result.push(
      missing("items", "Line items", "Add at least one product or service."),
    );
  }

  entities.items.forEach((item, index) => {
    if (!item.description?.trim()) {
      result.push(
        missing(`item.${index}.description`, `Item ${index + 1}`, "Add a product or service description."),
      );
    }
    if (!isFinitePositive(item.quantity)) {
      result.push(
        missing(`item.${index}.quantity`, `Quantity for ${item.description || `item ${index + 1}`}`, "Quantity must be explicitly provided and greater than zero.", ["quantity 1"]),
      );
    }
    if (!isFiniteNonNegative(item.unitPrice) && !isFiniteNonNegative(item.totalPrice)) {
      result.push(
        missing(`item.${index}.price`, `Price for ${item.description || `item ${index + 1}`}`, "Provide a unit price or an explicit line total."),
      );
    }
  });

  const hasInvoiceTax = Boolean(
    entities.invoiceTax?.taxes?.length ||
    entities.invoiceTax?.rate !== undefined ||
    entities.invoiceTax?.explicitlyZero,
  );
  const everyItemHasTax = entities.items.length > 0 && entities.items.every(
    (item) => Boolean(item.taxes?.length) || item.taxRate !== undefined || item.taxExplicitlyZero,
  );
  if (!hasInvoiceTax && !everyItemHasTax) {
    result.push(
      missing(
        "tax",
        "Tax / GST",
        "Tax must be explicitly provided. If no tax applies, say so explicitly.",
        ["18% GST", "5% GST", "4% GST", "10% SGST", "2.5% CGST", "No tax"],
      ),
    );
  }

  if (!invoice.currency?.trim()) {
    result.push(
      missing(
        "currency",
        "Currency",
        "Choose the currency for this invoice.",
        ["INR", "USD", "EUR", "GBP", "AED", "AUD", "CAD", "SGD", "JPY"],
      ),
    );
  }

  if (!autoGenerateInvoiceMetadata && !invoice.invoiceNumber?.trim()) {
    result.push(
      missing(
        "invoiceNumber",
        "Invoice number",
        "Provide an invoice number or enable automatic invoice numbering.",
        ["Invoice number INV-1001", "Invoice number INV-1002"],
      ),
    );
  }

  if (!autoGenerateInvoiceMetadata && !invoice.invoiceDate?.trim()) {
    result.push(
      missing(
        "invoiceDate",
        "Invoice date",
        "Provide an invoice date or enable automatic invoice dating.",
        ["Invoice date 2026-10-01", "Invoice date 2026-10-02"],
      ),
    );
  }

  if (!invoice.dueDate?.trim() && !isFiniteNonNegative(invoice.dueDays)) {
    result.push(
      missing(
        "dueDate",
        "Payment due date / terms",
        "Provide a due date or payment term. The app will not assume one.",
        ["due in 15 days", "due in 30 days", "due on 2026-10-15"],
      ),
    );
  }

  if (sellerProfile) {
    if (sellerProfile.taxRegistrations.length > 1 && !sellerProfile.selectedTaxRegistrationId) {
      result.push(missing("seller.taxRegistration", "GST / tax registration", "Select which seller GST/tax registration belongs on this invoice."));
    }
  }

  return result;
};

const resolveDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
};

const addDays = (date: string, days: number): string => {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const getInvoiceDate = (entities: ExtractedEntities, autoGenerate: boolean): string => {
  const explicit = resolveDate(entities.invoice.invoiceDate);
  if (explicit) return explicit;
  if (!autoGenerate) throw new Error("Invoice date is required.");
  return new Date().toISOString().slice(0, 10);
};

const getInvoiceNumber = (entities: ExtractedEntities, autoGenerate: boolean): string => {
  const explicit = entities.invoice.invoiceNumber?.trim();
  if (explicit) return explicit;
  if (!autoGenerate) throw new Error("Invoice number is required.");
  const suffix = String(Date.now()).slice(-6);
  return `INV-${suffix}`;
};

const resolveTaxes = (
  entities: ExtractedEntities,
  itemIndex: number,
): Array<{ rate: number; label?: string; explicitlyZero?: boolean }> => {
  const item = entities.items[itemIndex];

  if (item.taxes?.length) return item.taxes;
  if (item.taxExplicitlyZero) {
    return [{ rate: 0, label: item.taxLabel, explicitlyZero: true }];
  }
  if (item.taxRate !== undefined) {
    return [{ rate: item.taxRate, label: item.taxLabel }];
  }

  if (entities.invoiceTax?.taxes?.length) return entities.invoiceTax.taxes;
  if (entities.invoiceTax?.explicitlyZero) {
    return [{ rate: 0, label: entities.invoiceTax.label, explicitlyZero: true }];
  }
  if (entities.invoiceTax?.rate !== undefined) {
    return [{ rate: entities.invoiceTax.rate, label: entities.invoiceTax.label }];
  }

  throw new Error(`Tax is missing for item ${itemIndex + 1}.`);
};

const resolveItem = (
  item: ExtractedEntities["items"][number],
  index: number,
  entities: ExtractedEntities,
): InvoiceItem => {
  if (!isFinitePositive(item.quantity)) {
    throw new Error(`Invalid quantity for item ${index + 1}.`);
  }

  let unitPrice = item.unitPrice;
  if (unitPrice === undefined && item.totalPrice !== undefined) {
    unitPrice = item.totalPrice / item.quantity;
  }
  if (!isFiniteNonNegative(unitPrice)) {
    throw new Error(`Invalid price for item ${index + 1}.`);
  }

  const lineDiscount = item.discountPercentage !== undefined
    ? round(unitPrice * item.quantity * (item.discountPercentage / 100))
    : round(item.discountAmount ?? 0);
  const lineSubtotal = round(unitPrice * item.quantity);
  const lineNet = round(Math.max(0, lineSubtotal - lineDiscount));
  const taxes = resolveTaxes(entities, index).map((tax) => {
    if (!isFiniteNonNegative(tax.rate) || tax.rate > 100) {
      throw new Error(`Invalid tax rate for item ${index + 1}.`);
    }

    return {
      id: `tax-${crypto.randomUUID()}`,
      label: tax.label?.trim() || "Tax",
      rate: round(tax.rate),
      amount: round(lineNet * (tax.rate / 100)),
    };
  });

  const taxAmount = round(taxes.reduce((sum, tax) => sum + tax.amount, 0));
  const primaryTax = taxes[0];

  return {
    id: `item-${crypto.randomUUID()}`,
    description: item.description.trim(),
    hsnSacCode: item.hsnSacCode,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: round(unitPrice),
    // Legacy display fields retained for compatibility. New code should use taxes[].
    taxRate: primaryTax?.rate ?? 0,
    taxLabel: primaryTax?.label,
    taxes,
    taxAmount,
    discountAmount: lineDiscount,
    total: round(lineNet + taxAmount),
  };
};

const resolveSeller = (
  sellerProfile: SellerProfile | undefined,
  extractedSeller: ExtractedEntities["seller"],
): SellerProfile | undefined => {
  if (!sellerProfile && !extractedSeller?.name?.trim()) return undefined;

  const base: SellerProfile = sellerProfile ?? {
    id: `seller-${crypto.randomUUID()}`,
    businessName: extractedSeller?.name?.trim() || "",
    taxRegistrations: [],
  };

  const merged: SellerProfile = {
    ...base,
    businessName: extractedSeller?.name?.trim() || base.businessName,
    email: extractedSeller?.email?.trim() || base.email,
    phone: extractedSeller?.phone?.trim() || base.phone,
    address: extractedSeller?.address?.trim() || base.address,
    taxRegistrations: [...base.taxRegistrations],
  };

  if (extractedSeller?.taxId?.trim()) {
    const existing = merged.taxRegistrations.find(
      (tax) => tax.number.toLowerCase() === extractedSeller.taxId!.trim().toLowerCase(),
    );
    if (existing) {
      merged.selectedTaxRegistrationId = existing.id;
    } else {
      const registration = {
        id: `tax-${crypto.randomUUID()}`,
        type: "GSTIN" as const,
        number: extractedSeller.taxId.trim(),
      };
      merged.taxRegistrations.push(registration);
      merged.selectedTaxRegistrationId = registration.id;
    }
  }

  return merged.businessName.trim() ? merged : undefined;
};

export const assembleInvoice = (
  entities: ExtractedEntities,
  request: GenerateInvoiceRequest,
): Invoice => {
  const invoiceDate = getInvoiceDate(entities, Boolean(request.autoGenerateInvoiceMetadata));
  const invoiceNumber = getInvoiceNumber(entities, Boolean(request.autoGenerateInvoiceMetadata));
  const dueDate = resolveDate(entities.invoice.dueDate) ||
    (entities.invoice.dueDays !== undefined ? addDays(invoiceDate, entities.invoice.dueDays) : undefined);

  const items = entities.items.map((item, index) => resolveItem(item, index, entities));
  const subtotal = round(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const lineDiscount = round(items.reduce((sum, item) => sum + item.discountAmount, 0));
  const lineNetTotal = round(Math.max(0, subtotal - lineDiscount));
  const promptDiscount = entities.discountPercentage !== undefined
    ? round(lineNetTotal * (Math.min(100, Math.max(0, entities.discountPercentage)) / 100))
    : round(Math.max(0, entities.discountAmount ?? 0));
  const addonDiscount = request.addons?.discount
    ? request.addons.discount.type === "percentage"
      ? round(lineNetTotal * (Math.min(100, Math.max(0, request.addons.discount.value)) / 100))
      : round(Math.max(0, request.addons.discount.value))
    : 0;
  const invoiceDiscount = round(Math.min(lineNetTotal, promptDiscount + addonDiscount));

  // Invoice-level discounts reduce the taxable base before GST/VAT is calculated.
  // The discount is allocated proportionally across line items so each item's tax stays accurate.
  let remainingInvoiceDiscount = invoiceDiscount;
  items.forEach((item, index) => {
    const itemLineNet = round(Math.max(0, item.quantity * item.unitPrice - item.discountAmount));
    const allocatedDiscount = index === items.length - 1
      ? remainingInvoiceDiscount
      : lineNetTotal > 0
        ? round(invoiceDiscount * (itemLineNet / lineNetTotal))
        : 0;
    remainingInvoiceDiscount = round(Math.max(0, remainingInvoiceDiscount - allocatedDiscount));

    const taxableBase = round(Math.max(0, itemLineNet - allocatedDiscount));
    item.discountAmount = round(item.discountAmount + allocatedDiscount);
    item.taxes = item.taxes.map((tax) => ({
      ...tax,
      amount: round(taxableBase * (tax.rate / 100)),
    }));
    item.taxAmount = round(item.taxes.reduce((sum, tax) => sum + tax.amount, 0));
    item.total = round(taxableBase + item.taxAmount);
  });

  const discountAmount = round(lineDiscount + invoiceDiscount);
  const taxTotal = round(items.reduce((sum, item) => sum + item.taxAmount, 0));
  const taxableSubtotal = round(Math.max(0, subtotal - discountAmount));
  const grandTotal = round(taxableSubtotal + taxTotal);

  const currency = entities.invoice.currency!.trim().toUpperCase();
  const currencySymbol = entities.invoice.currencySymbol || CURRENCY_SYMBOLS[currency] || currency;
  const client = entities.client!;
  const sender = resolveSeller(request.sellerProfile, entities.seller);

  return {
    id: `inv-${crypto.randomUUID()}`,
    invoiceNumber,
    date: invoiceDate,
    dueDate,
    paymentTerms: entities.invoice.paymentTerms,
    currency,
    currencySymbol,
    sender,
    client,
    items,
    subtotal,
    discountAmount,
    discountPercentage: request.addons?.discount?.type === "percentage"
      ? request.addons.discount.value
      : entities.discountPercentage ?? 0,
    taxTotal,
    grandTotal,
    amountInWords: `${currency} ${grandTotal.toFixed(2)}`,
    addons: request.addons ?? {},
    notes: entities.invoice.notes || request.addons?.notes,
    terms: entities.invoice.termsAndConditions || request.addons?.terms,
    metadata: {
      generatedWith: "gemini",
      timestamp: new Date().toISOString(),
      userSuppliedFields: Object.keys(entities),
    },
  };
};

export const invoiceEngine = { checkMissingDetails, assembleInvoice } as const;
