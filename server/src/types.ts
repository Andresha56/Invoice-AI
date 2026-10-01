export interface TaxRegistration {
  id: string;
  label?: string;
  type: "GSTIN" | "VAT" | "TAX_ID";
  number: string;
  state?: string;
  isActive?: boolean;
}

export interface SellerProfile {
  id: string;
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  taxRegistrations: TaxRegistration[];
  selectedTaxRegistrationId?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
}

export interface ClientRecord {
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface ExtractedTax {
  label?: string;
  rate: number;
  explicitlyZero?: boolean;
}

export interface ExtractedEntities {
  invoice: {
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    dueDays?: number;
    paymentTerms?: string;
    currency?: string;
    currencySymbol?: string;
    notes?: string;
    termsAndConditions?: string;
  };
  seller?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };
  client?: ClientRecord;
  items: Array<{
    description: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
    taxes?: ExtractedTax[];
    // Legacy fields retained for backward compatibility with older model responses.
    taxRate?: number;
    taxLabel?: string;
    taxExplicitlyZero?: boolean;
    discountPercentage?: number;
    discountAmount?: number;
    hsnSacCode?: string;
  }>;
  invoiceTax?: {
    rate?: number;
    label?: string;
    explicitlyZero?: boolean;
    taxes?: ExtractedTax[];
  };
  discountPercentage?: number;
  discountAmount?: number;
}

export interface InvoiceTax {
  id: string;
  label: string;
  rate: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSacCode?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate: number;
  taxLabel?: string;
  taxes: InvoiceTax[];
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface InvoiceAddons {
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
  terms?: string;
  notes?: string;
  discount?: {
    type: "percentage" | "amount";
    value: number;
  };
  logoBase64?: string;
  qrBase64?: string;
  stampBase64?: string;
  signature?: string;
}

export interface MissingFieldInfo {
  field: string;
  label: string;
  message: string;
  quickSuggestions: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  paymentTerms?: string;
  currency: string;
  currencySymbol: string;
  sender?: SellerProfile;
  client: ClientRecord;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  taxTotal: number;
  grandTotal: number;
  amountInWords: string;
  addons: InvoiceAddons;
  notes?: string;
  terms?: string;
  metadata: {
    generatedWith: "gemini";
    timestamp: string;
    userSuppliedFields: string[];
  };
}

export interface GenerateInvoiceRequest {
  prompt: string;
  addons?: InvoiceAddons;
  sellerProfile?: SellerProfile;
  autoGenerateInvoiceMetadata?: boolean;
}

export interface GenerateInvoiceResponse {
  success: boolean;
  requiresClarification?: boolean;
  missingDetails?: MissingFieldInfo[];
  data?: Invoice;
  error?: string;
}
