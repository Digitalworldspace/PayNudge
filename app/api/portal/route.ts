import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dodo, siteUrl } from "@/lib/dodo";

// Opens the payment provider's billing page (change card, cancel, invoices).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl(request)}/login`, 303);

  const { data: sub } = await supabase.from("subscriptions").select("dodo_customer_id").eq("user_id", user.id).single();
  if (!sub?.dodo_customer_id) return NextResponse.redirect(`${siteUrl(request)}/app?billing=none`, 303);

  try {
    const portal = await dodo().customers.customerPortal.create(sub.dodo_customer_id);
    return NextResponse.redirect(portal.link, 303);
  } catch (e) {
    console.error("portal failed", e);
    return NextResponse.redirect(`${siteUrl(request)}/app?billing=error`, 303);
  }
}
