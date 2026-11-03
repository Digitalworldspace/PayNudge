import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/dodo";
import { createCheckoutUrl, provider } from "@/lib/billing";

// Starts a subscription checkout for the signed-in user.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl(request)}/login`, 303);

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  try {
    const url = await createCheckoutUrl({
      userId: user.id,
      email: user.email!,
      name: profile?.full_name || user.email!,
      returnUrl: `${siteUrl(request)}/app?checkout=done`,
    });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error(`checkout failed (${provider()})`, e);
    return NextResponse.redirect(`${siteUrl(request)}/app?checkout=error`, 303);
  }
}
