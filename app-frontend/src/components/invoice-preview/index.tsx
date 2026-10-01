import { forwardRef, useImperativeHandle, useRef } from "react";
import { FileText, Sparkles } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import type { Invoice } from "@/types/invoice";
import {
  formatMoney,
  getSelectedTaxRegistration,
  getTaxBreakdown,
} from "@/utils/invoice";

export interface InvoicePreviewRef {
  print: () => void;
}

interface Props {
  invoice: Invoice | null;
  isGenerating: boolean;
  onClear: () => void;
}

export const InvoicePreview = forwardRef<InvoicePreviewRef, Props>(
  ({ invoice, isGenerating }, ref) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
      contentRef: invoiceRef,
      documentTitle: () =>
        invoice?.invoiceNumber ? `Invoice-${invoice.invoiceNumber}` : "Invoice",
      pageStyle: `
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .invoice-print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: #fff !important; }
          .invoice-print-content { background: #fff !important; }
          .invoice-print-area header, .invoice-print-area section, .invoice-print-area table, .invoice-print-area tr, .invoice-print-area .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .invoice-print-area img { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          .invoice-print-area .overflow-x-auto { overflow: visible !important; }
          .invoice-print-area table { min-width: 0 !important; }
          .invoice-print-area .payment-details,
          .invoice-print-area .payment-qr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `,
      onPrintError: (location, error) => {
        console.error(`Invoice print failed during ${location}:`, error);
      },
    });

    useImperativeHandle(ref, () => ({
      print: () => {
        if (invoice && !isGenerating) handlePrint();
      },
    }), [handlePrint, invoice, isGenerating]);
  if (isGenerating)
    return (
      <div className="flex min-h-[720px] items-center justify-center rounded-[24px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
            <Sparkles className="h-6 w-6 animate-pulse text-indigo-600 dark:text-indigo-300" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            Creating your invoice
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Just a moment.
          </p>
        </div>
      </div>
    );

  if (!invoice)
    return (
      <div className="flex min-h-[720px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">
          Your invoice will appear here
        </h3>
        <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
          Add your invoice details and select Generate Invoice to preview it
          here.
        </p>
      </div>
    );

  const sellerTax = getSelectedTaxRegistration(invoice);
  const bank = invoice.addons.bankDetails;
  const taxBreakdown = getTaxBreakdown(invoice);

  return (
    <div className="min-w-0 print:w-full">
      <div className="mb-3 flex items-center justify-between px-1 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">
            Invoice Preview
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ready to review and download.
          </p>
        </div>
        
      </div>

      <article ref={invoiceRef} className="invoice-print-area overflow-hidden rounded-[24px] border border-slate-200 bg-[#fcfcfb] shadow-sm print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none dark:border-slate-800">
        <div className="invoice-print-content bg-[#fcfcfb] p-6 sm:p-8 print:bg-white print:p-4">
          <header className="flex flex-col gap-6 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between dark:border-slate-200">
            <div className="flex items-start gap-4">
              {invoice.addons.logoBase64 ? (
                <img
                  src={invoice.addons.logoBase64}
                  alt="Company logo"
                  className="h-16 w-16 rounded-xl object-contain"
                />
              ) : (
                null
              )}
              <div>
               
                <h1 className="mt-1.5 text-xl font-bold text-slate-950">
                  {invoice.sender?.businessName || "Invoice"}
                </h1>
                {invoice.sender?.address && (
                  <p className="mt-1.5 max-w-xs whitespace-pre-line text-[11px] leading-5 text-slate-500">
                    {invoice.sender.address}
                  </p>
                )}
                {invoice.sender?.email && (
                  <p className="text-[11px] text-slate-500">
                    {invoice.sender.email}
                  </p>
                )}
                {invoice.sender?.phone && (
                  <p className="text-[11px] text-slate-500">
                    {invoice.sender.phone}
                  </p>
                )}
                {sellerTax && (
                  <p className="mt-1 font-mono text-[10px] text-slate-500">
                    {sellerTax.type}: {sellerTax.number}
                  </p>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                INVOICE
              </h2>
              <p className="mt-3 text-[11px] font-semibold text-slate-700">
                {invoice.invoiceNumber}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Date: {invoice.date}
              </p>
              {invoice.dueDate && (
                <p className="text-[11px] text-slate-500">
                  Due: {invoice.dueDate}
                </p>
              )}
            </div>
          </header>

          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                From
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-900">
                {invoice.sender?.businessName || "Not provided"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Bill To
              </p>
              <p className="mt-1 text-xs font-bold text-slate-900">
                {invoice.client.companyName || invoice.client.name}
              </p>
              {invoice.client.companyName &&
                invoice.client.name !== invoice.client.companyName && (
                  <p className="text-[11px] text-slate-600">
                    {invoice.client.name}
                  </p>
                )}
              {invoice.client.address && (
                <p className="mt-1 whitespace-pre-line text-[11px] text-slate-500">
                  {invoice.client.address}
                </p>
              )}
              {invoice.client.email && (
                <p className="text-[11px] text-slate-500">
                  {invoice.client.email}
                </p>
              )}
              {invoice.client.taxId && (
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  Tax ID: {invoice.client.taxId}
                </p>
              )}
            </div>
          </section>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="bg-[#f4f6f8] text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3 text-center">Qty</th>
                  <th className="px-3 py-3 text-right">Unit Price</th>
                  <th className="px-3 py-3 text-right">Tax</th>
                  <th className="rounded-r-xl px-3 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-3 text-[11px] text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-900">
                      {item.description}
                      {item.unit && (
                        <span className="ml-1 font-normal text-slate-400">
                          ({item.unit})
                        </span>
                      )}
                      {item.hsnSacCode && (
                        <span className="mt-1 block font-mono text-[9px] font-normal text-slate-400">
                          HSN/SAC: {item.hsnSacCode}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs text-slate-700">
                      {formatMoney(invoice, item.unitPrice)}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-slate-600">
                      <div className="space-y-0.5">
                        {(item.taxes?.length
                          ? item.taxes
                          : [{ label: item.taxLabel || "Tax", rate: item.taxRate, amount: item.taxAmount }]
                        ).map((tax) => (
                          <div key={`${tax.label}-${tax.rate}`}>
                            {tax.label ? `${tax.label} ${tax.rate}%` : `${tax.rate}%`}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-slate-900">
                      {formatMoney(invoice, item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <div className="w-full max-w-xs rounded-xl border border-slate-200 bg-[#f5f6f7] p-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">
                  {formatMoney(invoice, invoice.subtotal)}
                </span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="mt-2 flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">
                    - {formatMoney(invoice, invoice.discountAmount)}
                  </span>
                </div>
              )}
              {taxBreakdown.length > 0 ? (
                taxBreakdown.map((tax) => (
                  <div
                    key={`${tax.label}-${tax.rate}`}
                    className="mt-2 flex justify-between text-slate-600"
                  >
                    <span>
                      {tax.label} ({tax.rate}%)
                    </span>
                    <span className="font-mono">
                      {formatMoney(invoice, tax.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="mt-2 flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="font-mono">
                    {formatMoney(invoice, invoice.taxTotal)}
                  </span>
                </div>
              )}
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-950">
                <span>Total</span>
                <span className="font-mono text-blue-600">
                  {formatMoney(invoice, invoice.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {(bank || invoice.addons.qrBase64) && (
            <section
              className={[
                "mt-7 border-t border-slate-100 pt-6",
                bank && invoice.addons.qrBase64
                  ? "grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"
                  : "flex",
                !bank && invoice.addons.qrBase64
                  ? "justify-end"
                  : "",
              ].join(" ")}
            >
              {bank && (
                <div
                  className={[
                    "payment-details rounded-xl border border-slate-200 bg-white p-4",
                    !invoice.addons.qrBase64 ? "w-full" : "",
                  ].join(" ")}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Payment Details
                  </p>
                  <div className="mt-2 grid gap-1 text-[11px] text-slate-600">
                    {bank.bankName && (
                      <p>
                        <b className="text-slate-800">Bank:</b> {bank.bankName}
                      </p>
                    )}
                    {bank.accountNumber && (
                      <p>
                        <b className="text-slate-800">A/C No:</b>{" "}
                        {bank.accountNumber}
                      </p>
                    )}
                    {bank.ifscCode && (
                      <p>
                        <b className="text-slate-800">IFSC:</b> {bank.ifscCode}
                      </p>
                    )}
                    {bank.accountName && (
                      <p>
                        <b className="text-slate-800">Account Name:</b>{" "}
                        {bank.accountName}
                      </p>
                    )}
                    {bank.branch && (
                      <p>
                        <b className="text-slate-800">Branch:</b> {bank.branch}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {invoice.addons.qrBase64 && (
                <div
                  className={[
                    "payment-qr rounded-xl border border-slate-200 bg-white p-4 text-center",
                    bank
                      ? "w-full"
                      : "w-[180px] max-w-full self-start",
                  ].join(" ")}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scan to Pay
                  </p>
                  <img
                    src={invoice.addons.qrBase64}
                    alt="Payment QR"
                    className="mx-auto mt-2 h-24 w-24 rounded-lg object-contain"
                  />
                </div>
              )}
            </section>
          )}

          {(invoice.addons.notes ||
            invoice.addons.terms ||
            invoice.notes ||
            invoice.terms) && (
            <section className="mt-7 border-t border-slate-100 pt-5 text-[11px] leading-5 text-slate-500">
              {(invoice.addons.notes || invoice.notes) && (
                <p>
                  <span className="font-semibold text-slate-800">Notes:</span>{" "}
                  {invoice.addons.notes || invoice.notes}
                </p>
              )}
              {(invoice.addons.terms || invoice.terms) && (
                <p className="mt-2 whitespace-pre-line">
                  <span className="font-semibold text-slate-800">
                    Terms & Conditions:
                  </span>{" "}
                  {invoice.addons.terms || invoice.terms}
                </p>
              )}
            </section>
          )}

          {(invoice.addons.stampBase64 || invoice.addons.signature) && (
            <section className="mt-7 flex justify-end gap-6 border-t border-slate-100 pt-6">
              {invoice.addons.signature && (
                <div className="min-w-32 text-center">
                  <div className="border-b border-slate-300 px-4 pb-2 text-sm italic text-slate-700">
                    {invoice.addons.signature}
                  </div>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Authorized Signature
                  </p>
                </div>
              )}
              {invoice.addons.stampBase64 && (
                <img
                  src={invoice.addons.stampBase64}
                  alt="Company stamp"
                  className="h-20 w-20 object-contain"
                />
              )}
            </section>
          )}
        </div>
      </article>
    </div>
  );
});
