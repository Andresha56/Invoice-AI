import { useState, type FC } from "react";
import { Building2, Check, ChevronRight, Plus, Trash2, X } from "lucide-react";
import type { SellerProfile, TaxRegistration } from "@/types/invoice";

const STORAGE_KEY = "invoice-ai.seller-profiles";
const readProfiles = (): SellerProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SellerProfile[]) : [];
  } catch {
    return [];
  }
};

interface Props {
  value?: SellerProfile;
  onChange: (profile?: SellerProfile) => void;
}

const emptyProfile = (): SellerProfile => ({
  id: crypto.randomUUID(),
  businessName: "",
  taxRegistrations: [],
});

export const SellerProfileManager: FC<Props> = ({ value, onChange }) => {
  const [profiles, setProfiles] = useState<SellerProfile[]>(readProfiles);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SellerProfile>(emptyProfile);
  const [taxNumber, setTaxNumber] = useState("");
  const [taxState, setTaxState] = useState("");

  const openEditor = () => {
    setDraft(value ? structuredClone(value) : emptyProfile());
    setTaxNumber("");
    setTaxState("");
    setOpen(true);
  };
  const save = () => {
    if (!draft.businessName.trim()) return;
    const next = profiles.some((profile) => profile.id === draft.id)
      ? profiles.map((profile) => (profile.id === draft.id ? draft : profile))
      : [...profiles, draft];
    setProfiles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    onChange(draft);
    setOpen(false);
  };
  const addTax = () => {
    if (!taxNumber.trim()) return;
    const registration: TaxRegistration = {
      id: crypto.randomUUID(),
      type: "GSTIN",
      number: taxNumber.trim(),
      state: taxState.trim() || undefined,
    };
    setDraft((current) => ({
      ...current,
      taxRegistrations: [...current.taxRegistrations, registration],
      selectedTaxRegistrationId:
        current.selectedTaxRegistrationId || registration.id,
    }));
    setTaxNumber("");
    setTaxState("");
  };

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className={`group flex min-h-[82px] items-center justify-between rounded-2xl border p-3 text-left transition ${value ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-800 dark:bg-indigo-950/20" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"}`}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
            <Building2 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-bold text-slate-900 dark:text-white">
              Seller / Business Details
            </span>
            <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
              {value ? value.businessName : "Add your business info"}
            </span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-violet-500 transition group-hover:translate-x-0.5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
                  <Building2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Seller / Business Details
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add these details once and reuse them whenever you need.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Business information
                </p>
                <input
                  value={draft.businessName}
                  onChange={(event) =>
                    setDraft({ ...draft, businessName: event.target.value })
                  }
                  placeholder="Business name *"
                  className="field"
                />
                <input
                  value={draft.email || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                  placeholder="Business email"
                  className="field"
                />
                <input
                  value={draft.phone || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, phone: event.target.value })
                  }
                  placeholder="Phone"
                  className="field"
                />
                <textarea
                  value={draft.address || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, address: event.target.value })
                  }
                  placeholder="Business address"
                  rows={6}
                  className="field resize-none"
                  style={{ height: "100px" }}
                />
              </div>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      GST registrations
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                      You can add multiple GSTINs and choose the one for this
                      invoice.
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {draft.taxRegistrations.map((tax) => (
                    <div
                      key={tax.id}
                      className={`flex items-center gap-2 rounded-xl border p-3 ${draft.selectedTaxRegistrationId === tax.id ? "border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      <input
                        type="radio"
                        checked={draft.selectedTaxRegistrationId === tax.id}
                        onChange={() =>
                          setDraft({
                            ...draft,
                            selectedTaxRegistrationId: tax.id,
                          })
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {tax.number}
                        </p>
                        {tax.state && (
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            {tax.state}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            taxRegistrations: draft.taxRegistrations.filter(
                              (item) => item.id !== tax.id,
                            ),
                            selectedTaxRegistrationId:
                              draft.selectedTaxRegistrationId === tax.id
                                ? undefined
                                : draft.selectedTaxRegistrationId,
                          })
                        }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-[1fr_100px_auto] gap-2">
                  <input
                    value={taxNumber}
                    onChange={(event) => setTaxNumber(event.target.value)}
                    placeholder="GSTIN"
                    className="field"
                  />
                  <input
                    value={taxState}
                    onChange={(event) => setTaxState(event.target.value)}
                    placeholder="State"
                    className="field"
                  />
                  <button
                    type="button"
                    onClick={addTax}
                    className="flex h-10 items-center justify-center rounded-xl border border-slate-300 px-3 text-violet-600 hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-violet-950/20"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Skip for now
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!draft.businessName.trim()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <Check className="h-3.5 w-3.5" /> Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
