import { useState, type FC } from "react";
import {
  AlertCircle,
  FileText,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { ADD_ONS } from "@/archetype/add-on";
import { MaxTextLength, SamplePrompts } from "@/constant";
import { AddOnButtons } from "@/components/add-on";
import { SellerProfileManager } from "@/components/seller-profile";
import type {
  InvoiceAddons,
  MissingFieldInfo,
  SellerProfile,
} from "@/types/invoice";

interface Props {
  onGenerate: (
    prompt: string,
    addons: InvoiceAddons,
    sellerProfile?: SellerProfile,
    autoGenerateInvoiceMetadata?: boolean,
  ) => void;
  isGenerating: boolean;
  uploadedAssets: Record<string, string>;
  onAssetUploaded: (id: string, base64: string) => void;
  missingDetails: MissingFieldInfo[] | null;
  onClearMissingDetails: () => void;
}

export const InvoiceComposer: FC<Props> = ({
  onGenerate,
  isGenerating,
  uploadedAssets,
  onAssetUploaded,
  missingDetails,
  onClearMissingDetails,
}) => {
  const [description, setDescription] = useState("");
  const [sellerProfile, setSellerProfile] = useState<SellerProfile>();
  const [autoGenerateMetadata, setAutoGenerateMetadata] = useState(false);
  const [addons, setAddons] = useState<InvoiceAddons>({
    logoBase64: uploadedAssets.logo,
    qrBase64: uploadedAssets.qr,
    stampBase64: uploadedAssets.stamp,
  });

  const updateAddons = (next: InvoiceAddons) => {
    setAddons(next);
    (["logo", "qr", "stamp"] as const).forEach((id) => {
      const value = next[`${id}Base64`];
      if (typeof value === "string") onAssetUploaded(id, value);
    });
  };

  const handleGenerate = () => {
    if (!description.trim()) return;
    onClearMissingDetails();
    onGenerate(description.trim(), addons, sellerProfile, autoGenerateMetadata);
  };

  const setExample = (example: string) => {
    setDescription(example.slice(0, MaxTextLength));
    onClearMissingDetails();
  };

  const applySuggestion = (field: string, suggestion: string) => {
    const value = field === "currency" ? `Currency: ${suggestion}` : suggestion;
    setDescription((current) =>
      `${current.trim()}${current.trim() ? "\n" : ""}${value}`.slice(
        0,
        MaxTextLength,
      ),
    );
    onClearMissingDetails();
  };

  return (
    <section className="min-w-0">
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Create Invoice
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Describe your invoice in simple words and let AI do the rest.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExample(SamplePrompts[0])}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Try an
              example
            </button>
          </div>

          <div className="relative mt-6">
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value.slice(0, MaxTextLength));
                onClearMissingDetails();
              }}
              maxLength={MaxTextLength}
              rows={5}
              placeholder="Create an invoice for ABC Ltd for website development, 2 pages at ₹25,000 each, 18% GST, due in 15 days."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 pb-8 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-950"
            />
            <span className="absolute bottom-3 right-4 text-[11px] font-medium text-slate-400">
              {description.length}/{MaxTextLength}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Creating invoice..." : "Generate Invoice"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDescription("");
                onClearMissingDetails();
              }}
              disabled={isGenerating || !description}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/40">
            <input
              type="checkbox"
              checked={autoGenerateMetadata}
              onChange={(event) =>
                setAutoGenerateMetadata(event.target.checked)
              }
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <span>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Automatically add invoice number & date
              </span>
            </span>
          </label>
        </div>

        {missingDetails?.length ? (
          <div className="border-t border-amber-100 bg-[#fffaf0] px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/20 sm:px-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-amber-100">
                  A few details are needed
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Choose an option or add the detail to your description.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {missingDetails.map((detail) => (
                    <div
                      key={detail.field}
                      className="rounded-xl border border-amber-200/80 bg-white p-3 dark:border-amber-900 dark:bg-slate-900"
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                        {detail.message}
                      </p>
                      {detail.quickSuggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {detail.quickSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() =>
                                applySuggestion(detail.field, suggestion)
                              }
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              Additional Details{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Add only the details you want to show on your invoice.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SellerProfileManager
            value={sellerProfile}
            onChange={setSellerProfile}
          />
          {ADD_ONS.map((addOn) => (
            <AddOnButtons
              key={addOn.id}
              addOn={addOn}
              addons={addons}
              onChange={updateAddons}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
