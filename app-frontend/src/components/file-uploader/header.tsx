import type { AddOn } from "@/archetype/add-on";

export const FileHeader = ({
  addOn,
  handleCancel,
}: {
  addOn: AddOn;
  handleCancel: () => void;
}) => {
  const Icon = addOn.icon;
  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${addOn.iconClass}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {addOn.label}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {addOn.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCancel}
        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:text-slate-200"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 6l12 12M18 6L6 18"
          />
        </svg>
      </button>
    </div>
  );
};
