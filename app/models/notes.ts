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
                metafield(namespace: "$app", key: "notes") {
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
