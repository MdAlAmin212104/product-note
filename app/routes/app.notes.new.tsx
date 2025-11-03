/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ActionFunctionArgs, useSubmit } from "react-router";
import { authenticate } from "app/shopify.server";

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
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const selectedProducts = JSON.parse(formData.get("products") as string);
  const noteTitle = formData.get("noteTitle") as string;
  const noteDescription = formData.get("noteDescription") as string;

  const newNote = {
    id: Date.now(),
    title: noteTitle,
    description: noteDescription,
    createdAt: new Date().toISOString(),
  };

  // Loop through each selected product and update its metafield
  for (const product of selectedProducts) {
    // 1️⃣ Fetch existing metafield notes
    const response = await admin.graphql(
      `#graphql
      query GetProductNotes($id: ID!) {
        product(id: $id) {
          metafield(namespace: "$app", key: "notes") {
            value
          }
        }
      }`,
      {
        variables: { id: product.id },
      }
    );

    const data = await response.json();
    let existingNotes: any[] = [];

    // 2️⃣ Parse existing value if exists
    const existingValue = data?.data?.product?.metafield?.value;
    if (existingValue) {
      try {
        existingNotes = JSON.parse(existingValue);
      } catch (e) {
        console.error("⚠️ Error parsing existing metafield JSON:", e);
        existingNotes = [];
      }
    }

    // 3️⃣ Add new note to list
    existingNotes.push(newNote);

    // 4️⃣ Save back to metafield
    await admin.graphql(
      `#graphql
      mutation SetMetafield($ownerId: ID!, $value: String!) {
        metafieldsSet(metafields: [{
          ownerId: $ownerId,
          namespace: "$app",
          key: "notes",
          type: "json",
          value: $value
        }]) {
          metafields {
            id
            key
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          ownerId: product.id,
          value: JSON.stringify(existingNotes),
        },
      }
    );
  }

  return { success: true };
};


export default function AdditionalPage() {
  const submit = useSubmit();
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

    submit(formData, { method: "post" });
    setLoading(false);
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
