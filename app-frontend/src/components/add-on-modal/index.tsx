import { useState, type FC } from "react";
import { X } from "lucide-react";
import type { AddOn } from "@/archetype/add-on";
import type { InvoiceAddons } from "@/types/invoice";

interface Props {
  addOn: AddOn | null;
  value: InvoiceAddons;
  onClose: () => void;
  onChange: (value: InvoiceAddons) => void;
}

const emptyBank = {
  accountName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branch: "",
};

export const AddOnModal: FC<Props> = ({ addOn, value, onClose, onChange }) => {
  const [bank, setBank] = useState(value.bankDetails ?? emptyBank);
  const [text, setText] = useState(
    addOn?.id === "signature"
      ? (value.signature ?? "")
      : addOn?.id === "notes"
        ? (value.notes ?? "")
        : (value.terms ?? ""),
  );
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    value.discount?.type ?? "percentage",
  );
  const [discountValue, setDiscountValue] = useState(
    value.discount?.value?.toString() ?? "",
  );

  if (!addOn) return null;

  const save = () => {
    if (addOn.id === "bank") {
      onChange({ ...value, bankDetails: bank });
    } else if (addOn.id === "signature") {
      onChange({ ...value, signature: text.trim() || undefined });
    } else if (addOn.id === "notes") {
      onChange({ ...value, notes: text.trim() || undefined });
    } else if (addOn.id === "terms") {
      onChange({ ...value, terms: text.trim() || undefined });
    } else if (addOn.id === "discount") {
      const numericValue = Number(discountValue);
      onChange({
        ...value,
        discount:
          Number.isFinite(numericValue) && numericValue >= 0
            ? { type: discountType, value: numericValue }
            : undefined,
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {addOn.label}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {addOn.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {addOn.id === "bank" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  "accountName",
                  "accountNumber",
                  "ifscCode",
                  "bankName",
                  "branch",
                ] as const
              ).map((field) => (
                <input
                  key={field}
                  value={bank[field] ?? ""}
                  onChange={(event) =>
                    setBank((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  placeholder={
                    {
                      accountName: "Account name",
                      accountNumber: "Account number",
                      ifscCode: "IFSC code",
                      bankName: "Bank name",
                      branch: "Branch",
                    }[field]
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              ))}
            </div>
          )}

          {["signature", "notes", "terms"].includes(addOn.id) && (
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={addOn.id === "signature" ? 3 : 6}
              placeholder={
                addOn.id === "signature"
                  ? "Authorized by / signature name"
                  : addOn.id === "notes"
                    ? "Add a note for your customer"
                    : "Add your terms and conditions"
              }
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          )}

          {addOn.id === "discount" && (
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder="Discount value"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <select
                value={discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as "percentage" | "amount")
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="percentage">%</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
