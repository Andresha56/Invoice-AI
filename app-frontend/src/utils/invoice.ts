import type { Invoice } from "@/types/invoice";

export const formatMoney = (invoice: Invoice, value: number) =>
  `${invoice.currencySymbol}${value.toLocaleString(
    invoice.currency === "INR" ? "en-IN" : "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

export const getSelectedTaxRegistration = (invoice: Invoice) =>
  invoice.sender?.taxRegistrations.find(
    (tax) => tax.id === invoice.sender?.selectedTaxRegistrationId,
  );

export interface TaxBreakdown {
  label: string;
  rate: number;
  amount: number;
}

export const getTaxBreakdown = (invoice: Invoice): TaxBreakdown[] => {
  const groups = new Map<string, TaxBreakdown>();

  invoice.items.forEach((item) => {
    const taxes = item.taxes?.length
      ? item.taxes
      : [{ label: item.taxLabel || "Tax", rate: item.taxRate, amount: item.taxAmount }];

    taxes.forEach((tax) => {
      const label = tax.label?.trim() || "Tax";
      const key = `${label.toLowerCase()}-${tax.rate}`;
      const current = groups.get(key);

      if (current) {
        current.amount += tax.amount;
      } else {
        groups.set(key, {
          label,
          rate: tax.rate,
          amount: tax.amount,
        });
      }
    });
  });

  return Array.from(groups.values()).map((tax) => ({
    ...tax,
    amount: Math.round((tax.amount + Number.EPSILON) * 100) / 100,
  }));
};
