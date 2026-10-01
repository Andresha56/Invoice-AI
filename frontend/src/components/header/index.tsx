import { Download, FilePlus2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/common/theme-toggle";

interface HeaderProps {
  onNewInvoice: () => void;
  onDownload: () => void;
  downloadDisabled: boolean;
}

export default function Header({
  onNewInvoice,
  onDownload,
  downloadDisabled,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90 print:hidden">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="InvoiceAI"
            className="h-10 w-10 rounded-xl object-contain shadow-sm"
          />
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-slate-950 dark:text-white">
              InvoiceAI
            </h1>
            <p className="hidden text-[11px] text-slate-500 sm:block dark:text-slate-400">
              Create invoices in seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={onNewInvoice}
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FilePlus2 className="h-4 w-4" />
            New Invoice
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloadDisabled}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
