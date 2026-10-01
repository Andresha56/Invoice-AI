import { useCallback, useState } from "react";
import type {
  Invoice,
  InvoiceAddons,
  MissingFieldInfo,
  SellerProfile,
} from "@/types/invoice";

interface GenerateOptions {
  prompt: string;
  addons: InvoiceAddons;
  sellerProfile?: SellerProfile;
  autoGenerateInvoiceMetadata: boolean;
}

export const useInvoiceGenerator = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missingDetails, setMissingDetails] = useState<
    MissingFieldInfo[] | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(
    async ({
      prompt,
      addons,
      sellerProfile,
      autoGenerateInvoiceMetadata,
    }: GenerateOptions) => {
      setIsGenerating(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/invoice/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            addons,
            sellerProfile,
            autoGenerateInvoiceMetadata,
          }),
        });
        const result = await response.json();

        if (result.requiresClarification && result.missingDetails) {
          setMissingDetails(result.missingDetails);
          return;
        }

        if (!response.ok || !result.success || !result.data) {
          const error = new Error(result.error || "Invoice generation failed.");
          // eslint-disable-next-line no-console
          console.error("[Invoice AI] Invoice generation failed", {
            status: response.status,
            response: result,
            cause: error,
          });
          throw error;
        }

        setInvoice(result.data);
        setMissingDetails(null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[Invoice AI] Unexpected invoice generation error",
          error,
        );
        setErrorMessage(
          "Something went wrong while creating your invoice. Please try again.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setInvoice(null);
    setMissingDetails(null);
    setErrorMessage(null);
  }, []);

  return {
    invoice,
    isGenerating,
    missingDetails,
    errorMessage,
    setMissingDetails,
    setErrorMessage,
    generate,
    reset,
  };
};
