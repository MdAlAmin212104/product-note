/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticate } from "app/shopify.server";

export async function getAllNotes(request: Request) {
  try {
    const { admin } = await authenticate.admin(request);

    let allProducts: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response: Response = await admin.graphql(
        `
        query getAllNotes($cursor: String) {
          products(first: 250, after: $cursor) {
            edges {
              cursor
              node {
                id
                title
                metafield(namespace: "custom-notes", key: "notes") {
                  value

                }
                media(first: 1) {
                  nodes {
                    preview {
                      image {
                        altText
                        url
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        `,
        { variables: { cursor } }
      );

      const result = await response.json();

      const edges = result?.data?.products?.edges || [];
      const products = edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        imageUrl: node.media?.nodes?.[0]?.preview?.image?.url || null,
        imageAlt: node.media?.nodes?.[0]?.preview?.image?.altText || null,
        notes: node.metafield?.value ? JSON.parse(node.metafield.value) : [],
      }));

      allProducts = [...allProducts, ...products];
      hasNextPage = result?.data?.products?.pageInfo?.hasNextPage;
      cursor = result?.data?.products?.pageInfo?.endCursor || null;
    }

    return allProducts;
  } catch (error) {
    console.error("❌ Error fetching all product notes:", error);
    return [];
  }
}


export async function updateNotes(request: Request) {
  try {
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
          metafield(namespace: "custom-notes", key: "notes") {
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
          namespace: "custom-notes",
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
  } catch (error) {
    console.error("❌ Error updating product notes:", error); 
  }
}


