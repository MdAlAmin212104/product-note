export type Note = {
  id?: number;
  title: string;
  description: string;
  createdAt?: string;
};

export async function updateNotes(id: string, newNotes: Note[]) {
  return await makeGraphQLQuery(
    `mutation SetMetafield($ownerId: ID!, $namespace: String!, $key: String!, $type: String!, $value: String!) {
      metafieldsSet(metafields: [{
        ownerId: $ownerId,
        namespace: $namespace,
        key: $key,
        type: $type,
        value: $value
      }]) {
        metafields {
          id
          namespace
          key
          jsonValue
        }
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      ownerId: id,
      namespace: "$app",
      key: "notes",
      type: "json",
      value: JSON.stringify(newNotes),
    },
  );
}

export async function getNotes(productId: string): Promise<Note[]> {
  const res = await makeGraphQLQuery(
    `query Product($id: ID!) {
      product(id: $id) {
        metafield(namespace: "$app", key: "notes") {
          value
        }
      }
    }`,
    { id: productId },
  );

  if (res?.data?.product?.metafield?.value) {
    const issues: Note[] = JSON.parse(res.data.product.metafield.value);
    const sortedIssues = issues.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.id ?? 0) - (a.id ?? 0);
    });
    return sortedIssues;
  }

  return [];
}

async function makeGraphQLQuery(
  query: string,
  variables: {
    ownerId?: string;
    namespace?: string;
    key?: string;
    type?: string;
    value?: string;
    id?: string;
  },
) {
  const graphQLQuery = { query, variables };

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });

  if (!res.ok) console.error("Network error");

  return await res.json();
}
