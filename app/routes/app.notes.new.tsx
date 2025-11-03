/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

// ✅ Declare Shopify resourcePicker type
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

export default function AdditionalPage() {
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteDescription, setNoteDescription] = useState("");

    // ✅ Open product picker
    async function selectProduct() {
        console.log("button click here");
        const products = await window.shopify.resourcePicker({
            type: "product",
            multiple: true,
            action: "select",
        });

        if (products && products.length > 0) {
            // 🧠 Filter to include only parent products (exclude variants)
            const productData = products
                // eslint-disable-next-line no-prototype-builtins
                .filter((p: any) => !p.hasOwnProperty("parent")) // exclude variant-level items
                .map((p: any) => ({
                    id: p.id,
                    title: p.title,
                }));
            setSelectedProducts(productData);
        }
    }


    // ✅ Remove all selected products
    function removeProducts() {
        setSelectedProducts([]);
        setNoteTitle("");
        setNoteDescription("");
    }

    // ✅ Handle form submit
    function handleSubmit() {
        const formData = {
            products: selectedProducts,
            noteTitle,
            noteDescription,
        };

        console.log("📝 Submitted Form Data:", formData);
    }

    return (
        <s-page heading="New Note Added Action">
            <s-section heading="Note Added Form">

                {/* 🛍️ Product Picker */}
                
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-clickable
                        paddingBlockEnd="base"
                        onClick={selectProduct}
                        accessibilityLabel="Select products"
                    >
                        <s-text-field
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

                {/* 📝 Note Title */}
                <s-text-field
                    label="Note Title"
                    
                    placeholder="Enter note title"
                    value={noteTitle}
                    onChange={(e: any) => setNoteTitle(e.target.value)}
                    maxLength={50}
                />

                {/* 📝 Note Description */}
                <s-text-area
                    label="Note Description"
                    placeholder="Enter note description"
                    maxLength={300}
                    value={noteDescription}
                    onChange={(e: any) => setNoteDescription(e.target.value)}
                />

                {/* 💾 Buttons */}
                <div style={{ display: "flex", justifyContent: "end", marginTop: "20px" }}>
                    <s-button-group>
                        <s-button slot="primary-action" onClick={handleSubmit}>
                            Save
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
