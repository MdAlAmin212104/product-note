/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useLoaderData,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { getAllNotes } from "app/models/notes";
import { useState } from "react";



/* Loader */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request); // destructure session from the result
  const allNotes = await getAllNotes(request);


  // session.shop contains the shop domain dynamically
  const shopDomain = session.shop;

  return { allNotes, shopDomain };
};

/* Action */
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

/* Table for all notes */
const NotesTable = ({
  productsWithNotes,
  shopDomain,
}: {
  productsWithNotes: any[];
  shopDomain: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = productsWithNotes.filter((product: any) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <s-section padding="base" accessibilityLabel="Product Notes Table">
      <s-search-field
        placeholder="Search for a product"
        autocomplete="on"
        value={searchQuery}
        onInput={(e: any) => setSearchQuery(e.target.value)}
      ></s-search-field>

      {filteredProducts.length === 0 ? (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <s-paragraph>No products found matching `{searchQuery}`</s-paragraph>
        </div>
      ) : (
        filteredProducts.map((product: any) => {
          const numericProductId = product.id.split("/").pop();
          const adminProductUrl = `https://${shopDomain}/admin/products/${numericProductId}`;
          const modalId = `modal-${numericProductId}`;

          return (
            <div key={product.id} style={{ marginTop: "10px" }}>
              <s-grid alignItems="center">
                <s-grid-item border="base" padding="base" borderRadius="base">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-clickable
                        href={adminProductUrl}
                        accessibilityLabel={`Go to the product page for ${product.title}`}
                        border="base"
                        borderRadius="base"
                        overflow="hidden"
                        inlineSize="20px"
                        blockSize="20px"
                      >
                        {product.imageUrl ? (
                          <s-image
                            objectFit="cover"
                            src={product.imageUrl}
                            alt={product.imageAlt || product.title}
                          ></s-image>
                        ) : (
                          <s-icon type="image" />
                        )}
                      </s-clickable>

                      <s-link href={adminProductUrl} target="_blank">
                        {product.title}
                      </s-link>
                    </s-stack>

                    <s-stack>
                      <s-button commandFor={modalId} tone="neutral">
                        Notes: {product.notes.length > 0 ? product.notes.length : "No notes"}
                      </s-button>

                      <s-modal id={modalId} heading={`Notes for ${product.title}`}>
                        {product.notes.length > 0 ? (
                          product.notes.map((note: any, index: number) => (
                            <s-stack key={note.id} padding="small">
                              <s-stack direction="inline">
                                <s-heading>Note {index + 1}:</s-heading>
                                <s-heading>{note.title}</s-heading>
                              </s-stack>
                              <s-paragraph>{note.description}</s-paragraph>
                            </s-stack>
                          ))
                        ) : (
                          <s-paragraph>No notes found for this product.</s-paragraph>
                        )}
                      </s-modal>
                    </s-stack>
                  </div>
                </s-grid-item>
              </s-grid>
            </div>
          );
        })
      )}
    </s-section>
  );
};

/* Empty state */
const EmptyState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
          alt="Create a New Note"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>Create unique Notes for your products</s-heading>
        <p style={{ textAlign: "center" }}>
          Add personalized notes to each product to provide extra information or engage your customers.
        </p>

        <s-stack
          gap="small-200"
          justifyContent="center"
          padding="base"
          paddingBlockEnd="none"
          direction="inline"
        >
          <s-button href="/app/notes/new" variant="primary">
            Create Note
          </s-button>
        </s-stack>
      </s-grid>
    </s-grid>
  </s-section>
);

/* Main component */
export default function Index() {
  const { allNotes, shopDomain } = useLoaderData<typeof loader>();

  const productsWithNotes = allNotes?.filter(
    (product: any) => Array.isArray(product.notes) && product.notes.length > 0
  );

  return (
    <s-page heading="Shopify App Notes">
      <s-section heading="Overview">
        <s-grid gap="small" gridTemplateColumns="repeat(4, 1fr)">
          <s-grid-item>
            <s-box padding="base" background="subdued" border="base" borderRadius="base">
              <s-heading>Total Products</s-heading>
              <s-paragraph>{allNotes.length}</s-paragraph>
            </s-box>
          </s-grid-item>
          <s-grid-item>
			<s-box padding="base" background="subdued" border="base" borderRadius="base">
            <s-heading>Total Notes</s-heading>
            <s-paragraph>
              {productsWithNotes.reduce((sum, p) => sum + p.notes.length, 0)}
            </s-paragraph>
			</s-box>
          </s-grid-item>
          <s-grid-item>
			<s-box padding="base" background="subdued" border="base" borderRadius="base">
            <s-heading>Products with Notes</s-heading>
            <s-paragraph>
              {productsWithNotes.length}
            </s-paragraph>
			</s-box>
          </s-grid-item>
          <s-grid-item>
			<s-box padding="base" background="subdued" border="base" borderRadius="base">
            <s-heading>Products without Notes</s-heading>
            <s-paragraph>
              {allNotes.length - productsWithNotes.length}
            </s-paragraph>
			</s-box>
          </s-grid-item>
        </s-grid>

      </s-section>

      <s-link slot="secondary-actions" href="/app/notes/new">
        Create New Note
      </s-link>

      {productsWithNotes.length === 0 ? (
        <EmptyState />
      ) : (
        <NotesTable productsWithNotes={productsWithNotes} shopDomain={shopDomain} />
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};