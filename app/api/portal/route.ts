import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/dodo";
import { createPortalUrl, provider } from "@/lib/billing";

// Opens the payment provider's billing page (change card, cancel, receipts).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl(request)}/login`, 303);

  const { data: sub } = await supabase.from("subscriptions").select("dodo_customer_id").eq("user_id", user.id).maybeSingle();

  try {
    const link = await createPortalUrl({ userId: user.id, providerCustomerId: sub?.dodo_customer_id ?? null });
    if (!link) return NextResponse.redirect(`${siteUrl(request)}/app?billing=none`, 303);
    return NextResponse.redirect(link, 303);
  } catch (e) {
    console.error(`portal failed (${provider()})`, e);
    return NextResponse.redirect(`${siteUrl(request)}/app?billing=error`, 303);
  }
}
