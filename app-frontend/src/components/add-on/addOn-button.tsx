import { useCallback, type FC } from "react";
import { ADD_ON_Type, type AddOn } from "@/archetype/add-on";
import { Check, ChevronRight, Plus } from "lucide-react";

interface Props {
  addOn: AddOn;
  handleAddOnTextClick?: (addOn: AddOn) => void;
  handleFileClick?: () => void;
  isUploaded?: boolean;
}

export const AddOnButton: FC<Props> = ({
  addOn,
  handleAddOnTextClick,
  handleFileClick,
  isUploaded,
}) => {
  const Icon = addOn.icon;
  const handleClick = useCallback(
    () =>
      addOn.type === ADD_ON_Type.Text
        ? handleAddOnTextClick?.(addOn)
        : handleFileClick?.(),
    [addOn, handleAddOnTextClick, handleFileClick],
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group flex min-h-[82px] items-center justify-between rounded-2xl border p-3 text-left transition ${isUploaded ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"}`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${addOn.iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
              {addOn.label}
            </span>
            {isUploaded && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Added
              </span>
            )}
          </span>
          <span className="mt-1 block truncate text-[11px] text-slate-500 dark:text-slate-400">
            {addOn.description}
          </span>
        </span>
      </span>
      <span
        className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${isUploaded ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"}`}
      >
        {isUploaded ? (
          <Check className="h-3.5 w-3.5" />
        ) : addOn.type === ADD_ON_Type.Text ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
};
