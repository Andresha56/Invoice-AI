import { InvoiceComposer } from "@/components/invoice-composer";
import Header from "@/components/header";
import { InvoicePreview } from "@/components/invoice-preview";
import { useInvoiceGenerator } from "@/hooks/useInvoiceGenerator";
import { useRef, useState } from "react";
import type { InvoicePreviewRef } from "@/components/invoice-preview";

export const App = () => {
  const generator = useInvoiceGenerator();
  const [uploadedAssets, setUploadedAssets] = useState<Record<string, string>>(
    {},
  );
  const invoicePreviewRef = useRef<InvoicePreviewRef>(null);

  const handleDownload = () => {
    invoicePreviewRef.current?.print();
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950 transition-colors dark:bg-[#090d17] dark:text-slate-100">
      <Header
        onNewInvoice={generator.reset}
        onDownload={handleDownload}
        downloadDisabled={!generator.invoice || generator.isGenerating}
      />

      {generator.errorMessage && (
        <div className="mx-auto mt-4 flex max-w-[1500px] items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 print:hidden">
          <span>{generator.errorMessage}</span>
          <button
            type="button"
            onClick={() => generator.setErrorMessage(null)}
            className="rounded-lg px-2 py-1 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40"
          >
            ×
          </button>
        </div>
      )}

      <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(520px,0.98fr)] lg:px-8 lg:py-6 xl:gap-6 print:block print:max-w-none print:p-0">
        <div className="print:hidden">
          <InvoiceComposer
            onGenerate={(
              prompt,
              addons,
              sellerProfile,
              autoGenerateInvoiceMetadata,
            ) =>
              generator.generate({
                prompt,
                addons,
                sellerProfile,
                autoGenerateInvoiceMetadata: Boolean(
                  autoGenerateInvoiceMetadata,
                ),
              })
            }
            isGenerating={generator.isGenerating}
            uploadedAssets={uploadedAssets}
            onAssetUploaded={(id, base64) =>
              setUploadedAssets((current) => ({ ...current, [id]: base64 }))
            }
            missingDetails={generator.missingDetails}
            onClearMissingDetails={() => generator.setMissingDetails(null)}
          />
        </div>
        <InvoicePreview
          ref={invoicePreviewRef}
          invoice={generator.invoice}
          isGenerating={generator.isGenerating}
          onClear={generator.reset}
        />
      </main>
    </div>
  );
};
