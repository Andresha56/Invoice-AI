import type { ExtractedEntities } from "../types.js";

const CURRENCY_SYMBOLS: Record<string, { code: string; symbol: string }> = {
  "₹": { code: "INR", symbol: "₹" },
  "$": { code: "USD", symbol: "$" },
  "€": { code: "EUR", symbol: "€" },
  "£": { code: "GBP", symbol: "£" },
  "¥": { code: "JPY", symbol: "¥" },
  "₩": { code: "KRW", symbol: "₩" },
  "₽": { code: "RUB", symbol: "₽" },
  "₫": { code: "VND", symbol: "₫" },
  "₦": { code: "NGN", symbol: "₦" },
  "₱": { code: "PHP", symbol: "₱" },
  "₺": { code: "TRY", symbol: "₺" },
  "د.إ": { code: "AED", symbol: "د.إ" },
};

const CURRENCY_CODES = new Set([
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "AUD",
  "CAD",
  "SGD",
  "JPY",
  "CNY",
  "HKD",
  "NZD",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "ZAR",
  "BRL",
  "MXN",
  "KRW",
  "THB",
  "MYR",
  "IDR",
  "PHP",
  "NGN",
  "TRY",
  "PLN",
  "RUB",
]);

const CURRENCY_SYMBOL_BY_CODE: Record<string, string> = {
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

const firstMatch = (text: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
};

const parseCurrency = (prompt: string): { code?: string; symbol?: string } => {
  for (const [symbol, currency] of Object.entries(CURRENCY_SYMBOLS)) {
    if (prompt.includes(symbol)) return currency;
  }

  const code = prompt.match(/\b(INR|USD|EUR|GBP|AED|AUD|CAD|SGD|JPY|CNY|HKD|NZD|CHF|SEK|NOK|DKK|ZAR|BRL|MXN|KRW|THB|MYR|IDR|PHP|NGN|TRY|PLN|RUB)\b/i)?.[1]?.toUpperCase();
  if (code && CURRENCY_CODES.has(code)) {
    return { code, symbol: CURRENCY_SYMBOL_BY_CODE[code] };
  }

  if (/\b(?:rs\.?|inr)\b/i.test(prompt)) return { code: "INR", symbol: "₹" };

  const currencyName = prompt.match(/\b(rupees?|rupee|dollars?|euros?|pounds?)\b/i)?.[1]?.toLowerCase();
  if (currencyName) {
    if (currencyName.startsWith("rupee")) return { code: "INR", symbol: "₹" };
    if (currencyName.startsWith("dollar")) return { code: "USD", symbol: "$" };
    if (currencyName.startsWith("euro")) return { code: "EUR", symbol: "€" };
    if (currencyName.startsWith("pound")) return { code: "GBP", symbol: "£" };
  }

  return {};
};

const parseTaxes = (prompt: string): ExtractedEntities["invoiceTax"] | undefined => {
  if (/\b(no tax|tax exempt|tax-exempt|tax not applicable|without tax)\b/i.test(prompt)) {
    return {
      rate: 0,
      label: "No tax",
      explicitlyZero: true,
      taxes: [{ rate: 0, label: "No tax", explicitlyZero: true }],
    };
  }

  const taxes: NonNullable<ExtractedEntities["invoiceTax"]>["taxes"] = [];
  const labels = "GST|CGST|SGST|IGST|UTGST|VAT|TDS|TCS|CESS|SALES TAX|SERVICE TAX|WITHHOLDING TAX|EXCISE DUTY|CUSTOMS DUTY|TAX";
  const patterns = [
    new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%\\s*(${labels})\\b`, "gi"),
    new RegExp(`\\b(${labels})\\s*(?:at|of|:)\\s*(\\d+(?:\\.\\d+)?)\\s*%`, "gi"),
  ];

  for (const pattern of patterns) {
    for (const match of prompt.matchAll(pattern)) {
      const first = match[1];
      const second = match[2];
      const rate = Number(/^\d/.test(first) ? first : second);
      const label = (/^\d/.test(first) ? second : first).trim();
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) continue;
      taxes.push({ rate, label, explicitlyZero: rate === 0 });
    }
  }

  const unique = taxes.filter((tax, index, list) =>
    list.findIndex((candidate) =>
      candidate.rate === tax.rate && candidate.label?.toLowerCase() === tax.label?.toLowerCase(),
    ) === index,
  );

  if (!unique.length) return undefined;
  return {
    taxes: unique,
    ...(unique.length === 1
      ? {
          rate: unique[0].rate,
          label: unique[0].label,
          explicitlyZero: unique[0].explicitlyZero,
        }
      : {}),
  };
};

export const extractExplicitInvoiceHints = (prompt: string): Partial<ExtractedEntities> => {
  const currency = parseCurrency(prompt);
  const tax = parseTaxes(prompt);

  const invoiceNumber = firstMatch(prompt, [
    /\binvoice(?:\s+(?:number|no\.?|#))?\s*[:#-]?\s*([A-Z][A-Z0-9-]*\d[A-Z0-9-]*)\b/i,
  ]);

  const invoiceDate = firstMatch(prompt, [
    /\b(?:invoice\s+)?dated?\s*(?:on)?\s*(\d{4}-\d{2}-\d{2})\b/i,
    /\binvoice\s+date\s*[:=-]?\s*(\d{4}-\d{2}-\d{2})\b/i,
  ]);

  const dueDaysMatch = prompt.match(/\bdue\s+in\s+(\d+)\s+days?\b/i);
  const dueDate = firstMatch(prompt, [
    /\bdue\s+(?:on|by)\s+(\d{4}-\d{2}-\d{2})\b/i,
    /\bdue\s+date\s*[:=-]?\s*(\d{4}-\d{2}-\d{2})\b/i,
  ]);

  const invoice: ExtractedEntities["invoice"] = {};
  if (invoiceNumber) invoice.invoiceNumber = invoiceNumber;
  if (invoiceDate) invoice.invoiceDate = invoiceDate;
  if (dueDate) invoice.dueDate = dueDate;
  if (dueDaysMatch) invoice.dueDays = Number(dueDaysMatch[1]);
  if (currency.code) {
    invoice.currency = currency.code;
    invoice.currencySymbol = currency.symbol;
  }

  return {
    invoice,
    ...(tax ? { invoiceTax: tax } : {}),
  };
};

export const mergeExplicitInvoiceHints = (
  extracted: ExtractedEntities,
  hints: Partial<ExtractedEntities>,
): ExtractedEntities => {
  const invoice = { ...extracted.invoice, ...hints.invoice };
  const invoiceTax = hints.invoiceTax ?? extracted.invoiceTax;
  const invoiceTaxes = invoiceTax?.taxes ?? (invoiceTax?.rate !== undefined
    ? [{ rate: invoiceTax.rate, label: invoiceTax.label, explicitlyZero: invoiceTax.explicitlyZero }]
    : undefined);

  return {
    ...extracted,
    invoice,
    invoiceTax: invoiceTax
      ? { ...invoiceTax, taxes: invoiceTaxes }
      : undefined,
    items: extracted.items.map((item) => ({
      ...item,
      // Never overwrite item-specific tax data with an invoice-level hint.
      ...(item.taxes?.length || item.taxRate !== undefined || item.taxExplicitlyZero
        ? {}
        : invoiceTaxes?.length
          ? { taxes: invoiceTaxes }
          : {}),
    })),
  };
};
