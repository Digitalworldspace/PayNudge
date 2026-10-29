"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "link") {
      setState("error");
      setError("That sign-in link has expired or was already used. Enter your email to get a new one.");
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setState("error");
      setError(error.message);
    } else setState("sent");
  }

  return (
    <div className="wrap narrow">
      <header className="top">
        <a href="/" className="brand">Pay<span>Nudge</span></a>
      </header>
      <section className="panel">
        <h1 style={{ fontSize: "1.6rem" }}>Sign in or start your free trial</h1>
        {state === "sent" ? (
          <p>
            Check <b>{email}</b> for a sign-in link. It can take a minute to arrive; look in spam if you don&apos;t see it.
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <div className="field">
              <label className="label" htmlFor="email">Work email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
            </div>
            <button className="primary" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending link…" : "Email me a sign-in link"}
            </button>
            {state === "error" && <p className="hint" style={{ color: "var(--bad)" }}>{error}</p>}
            <p className="hint">No password needed. New here? Your 14-day free trial starts when you first sign in.</p>
          </form>
        )}
      </section>
    </div>
  );
}
