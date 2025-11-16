import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { sendUninstallEmail } from "app/utils/sendEmail.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`🔔 Received ${topic} webhook for shop: ${shop}`);

  const shopFind = await db.shop.findUnique({ where: { domain: shop } });

  const email = shopFind?.email as string;
  // 📨 Send uninstall email
  await sendUninstallEmail(shop, email);

  // 🗑️ Delete shop record
  if (shopFind) {
    await db.shop.deleteMany({ where: { domain: shop } });
    console.log(`🗑️ Deleted shop for domain: ${shop}`);
  }

  // 🗑️ Delete session record
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response("Webhook processed successfully", { status: 200 });
};
