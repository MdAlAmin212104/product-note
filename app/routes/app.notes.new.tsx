/* eslint-disable @typescript-eslint/no-explicit-any */

import { updateNotes } from "app/models/notes";
import { useState } from "react";
import { ActionFunctionArgs, useNavigate, useSubmit } from "react-router";

declare global {
  interface Window {
    shopify: {
      resourcePicker: (options: {
        type: string;
        multiple?: boolean;
        action?: string;
      }) => Promise<any>;
    };
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  return await updateNotes(request);
};

export default function NewNote() {
  const submit = useSubmit();
  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
    });

    if (products && products.length > 0) {
      const productData = products.map((p: any) => ({
        id: p.id,
        title: p.title,
      }));
      setSelectedProducts(productData);
    }
  }

  function removeProducts() {
    setSelectedProducts([]);
    setNoteTitle("");
    setNoteDescription("");
  }

  async function handleSubmit() {
    if (!noteTitle || !noteDescription || selectedProducts.length === 0) {
      alert("Please fill all fields and select at least one product.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("products", JSON.stringify(selectedProducts));
    formData.append("noteTitle", noteTitle);
    formData.append("noteDescription", noteDescription);
    console.log(formData, "this is form data ----------------------------------");

    await submit(formData, {
      method: "post",
      encType: "multipart/form-data"
    });
    setLoading(false);
    // alert("Note created successfully!");

    navigate("/app");
  }

  return (
    <s-page heading="Create Product Notes">
      <s-section heading="Create Note">
        {/* Product Picker */}
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-clickable
            paddingBlockEnd="base"
            onClick={selectProduct}
            accessibilityLabel="Select products"
          >
            <s-text-field
              required
              label="Select Products"
              placeholder="Select one or more products"
              value={
                selectedProducts.length > 0
                  ? selectedProducts.map((p) => p.title).join(", ")
                  : ""
              }
              readOnly
            />
          </s-clickable>
        </s-stack>

        {/* Note Title */}
        <s-text-field
          required
          label="Note Title"
          value={noteTitle}
          onChange={(e: any) => setNoteTitle(e.target.value)}
          maxLength={50}
        />

        {/* Note Description */}
        <s-text-area
          required
          label="Note Description"
          maxLength={300}
          value={noteDescription}
          onChange={(e: any) => setNoteDescription(e.target.value)}
        />

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "end", marginTop: "20px" }}>
          <s-button-group>
            <s-button slot="primary-action" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </s-button>
            <s-button slot="secondary-actions" tone="critical" onClick={removeProducts}>
              Cancel
            </s-button>
          </s-button-group>
        </div>
      </s-section>
    </s-page>
  );
}
