/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "../db.server";

export async function handleShopInfo(shopDomain: string, accessToken: string, admin: any) {
  const response = await admin.graphql(`
    query {
      shop {
        name
        contactEmail
        email
        myshopifyDomain
      }
    }
  `);

  const result = await response.json();
  const shopData = result.data.shop;

  const shopEmail = shopData.contactEmail || shopData.email || null;

  await prisma.shop.upsert({
    where: { domain: shopData.myshopifyDomain },
    update: {
      name: shopData.name,
      email: shopEmail,
      accessToken,
    },
    create: {
      domain: shopData.myshopifyDomain,
      name: shopData.name,
      email: shopEmail,
      accessToken,
    },
  });

}
