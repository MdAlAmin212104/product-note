import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import prisma from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // 🔹 Step 1: Authenticate webhook (for uninstall event, etc.)
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`🔔 Received ${topic} webhook for shop: ${shop}`);
  const shopFind = await prisma.shop.findUnique({ where: { domain: shop } });

  console.log(shopFind, "--------------------- undatall kore hyce dta ")

  console.log("✅ Shop Email:", shopFind.email);
  console.log("🏬 Shop Name:", shopFind.name);
  console.log("🌐 Shop Domain:", shopFind.domain);

  // 🔹 Step 3: Optional — delete session if app uninstalled
  if (session) {
    await db.session.deleteMany({ where: { shop } });
    await prisma.shop.deleteMany({ where: { domain: shop } });
    console.log(`🗑️ Deleted session for shop: ${shop}`);
  }

  // ✅ Respond success
  return new Response("Webhook processed successfully", { status: 200 });
};
