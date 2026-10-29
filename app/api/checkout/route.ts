import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodo, siteUrl } from "@/lib/dodo";

// Starts a subscription checkout for the signed-in user.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl()}/login`, 303);

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  try {
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: process.env.DODO_PRODUCT_ID!, quantity: 1 }],
      customer: { email: user.email!, name: profile?.full_name || user.email! },
      return_url: `${siteUrl()}/app?checkout=done`,
      metadata: { user_id: user.id },
    });
    return NextResponse.redirect(session.checkout_url, 303);
  } catch (e) {
    console.error("checkout failed", e);
    return NextResponse.redirect(`${siteUrl()}/app?checkout=error`, 303);
  }
}
