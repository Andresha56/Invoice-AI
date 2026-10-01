import { useState, type FC } from "react";
import { ADD_ON_Type, type AddOn } from "@/archetype/add-on";
import { FileUploader } from "@/components/file-uploader";
import { AddOnButton } from "./addOn-button";
import { AddOnModal } from "@/components/add-on-modal";
import type { InvoiceAddons } from "@/types/invoice";

interface Props {
  addOn: AddOn;
  addons: InvoiceAddons;
  onChange: (value: InvoiceAddons) => void;
}

export const AddOnButtons: FC<Props> = ({ addOn, addons, onChange }) => {
  const [open, setOpen] = useState(false);
  const key = `${addOn.id}Base64` as keyof InvoiceAddons;
  const isAdded =
    addOn.id === "bank"
      ? Boolean(
          addons.bankDetails && Object.values(addons.bankDetails).some(Boolean),
        )
      : addOn.id === "signature"
        ? Boolean(addons.signature)
        : addOn.id === "notes"
          ? Boolean(addons.notes)
          : addOn.id === "terms"
            ? Boolean(addons.terms)
            : addOn.id === "discount"
              ? Boolean(addons.discount)
              : Boolean(addons[key]);

  if (addOn.type === ADD_ON_Type.File)
    return (
      <FileUploader
        addOn={addOn}
        onUpload={(id, base64) =>
          onChange({ ...addons, [`${id}Base64`]: base64 } as InvoiceAddons)
        }
        isUploaded={isAdded}
      />
    );
  return (
    <>
      <AddOnButton
        addOn={addOn}
        handleAddOnTextClick={() => setOpen(true)}
        isUploaded={isAdded}
      />
      {open && (
        <AddOnModal
          addOn={addOn}
          value={addons}
          onClose={() => setOpen(false)}
          onChange={onChange}
        />
      )}
    </>
  );
};
