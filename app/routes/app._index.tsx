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
}) => (
  <s-section padding="base" accessibilityLabel="Product Notes Table">
    <s-search-field placeholder="Search for a product"></s-search-field>

    {productsWithNotes.map((product: any) => {
      const numericProductId = product.id.split("/").pop();
      const adminProductUrl = `https://${shopDomain}/admin/products/${numericProductId}`;
      const modalId = `modal-${numericProductId}`; // ✅ unique modal ID

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
                    target="_blank"
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
                  {/* ✅ Button linked to this specific modal */}
                  <s-button commandFor={modalId} tone="neutral">
                    Notes: {product.notes.length > 0 ? product.notes.length : "No notes"}
                  </s-button>

                  {/* ✅ Modal has matching ID */}
                  <s-modal id={modalId} heading={`Notes for ${product.title}`}>
                    {product.notes.length > 0 ? (
                      product.notes.map((note: any, index: number) => (
                        <s-stack key={note.id} padding="small">
                          <s-stack direction="inline" gap="small">
                            <s-heading>{index + 1}</s-heading>
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
    })}
  </s-section>
);


/* Empty state */
const EmptyState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="A stylized graphic of a document"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>Create unique Notes for your products</s-heading>
        <s-paragraph>
          Add personalized notes to each product to provide extra information or engage your customers.
        </s-paragraph>
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
        Total Products: {allNotes.length}, Total Notes:{" "}
        {productsWithNotes.reduce((sum, p) => sum + p.notes.length, 0)}
      </s-section>

      <s-divider></s-divider>

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