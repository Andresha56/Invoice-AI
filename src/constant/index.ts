import type { LucideIcon } from "lucide-react";

import {
  Image as ImageIcon,
  QrCode,
  Landmark,
  Stamp,
  PenTool,
  StickyNote,
  ScrollText,
  Percent,
} from "lucide-react";

export const SamplePrompts = [
  "Create an invoice for 2 logo designs at ₹5,000 each",
  "Generate invoices for all customers in this file",
  "Create an invoice with 18% GST and 30 days payment terms",
];

export const MaxTextLength = 1000;

export const selectionType = {
  manual: "manual",
  excel: "excel",
} as const;

export type AddOn = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  text?: string;
};

export const ADD_ONS: AddOn[] = [
  {
    id: "logo",
    label: "Company Logo",
    description: "Upload your company logo",
    icon: ImageIcon,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    id: "qr",
    label: "Payment QR",
    description: "Add UPI or payment QR",
    icon: QrCode,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "bank",
    label: "Bank Details",
    description: "Add bank account details",
    icon: Landmark,
    iconClass: "bg-rose-100 text-rose-600",
    text: `Bank Details:
        Account Name:
        Account Number:
        IFSC Code:
        Bank Name:`,
  },
  {
    id: "stamp",
    label: "Company Stamp",
    description: "Upload company stamp",
    icon: Stamp,
    iconClass: "bg-orange-100 text-orange-600",
  },
  {
    id: "signature",
    label: "Signature",
    description: "Add authorized signature",
    icon: PenTool,
    iconClass: "bg-purple-100 text-purple-600",
    text: "Signature:",
  },
  {
    id: "notes",
    label: "Notes",
    description: "Add terms, notes or message",
    icon: StickyNote,
    iconClass: "bg-teal-100 text-teal-600",
    text: "Notes:",
  },
  {
    id: "terms",
    label: "Terms & Conditions",
    description: "Add payment terms & conditions",
    icon: ScrollText,
    iconClass: "bg-indigo-100 text-indigo-600",
    text: `Terms & Conditions:
    1. Payment due within 15 days.
    2. Please make payment to the provided bank account.`,
  },
  {
    id: "discount",
    label: "Discount",
    description: "Apply a discount to the invoice",
    icon: Percent,
    iconClass: "bg-amber-100 text-amber-600",
    text: "Discount: 10%",
  },
];
