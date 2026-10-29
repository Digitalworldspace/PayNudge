"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "link") {
      setError("That sign-in link has expired or was already used. Enter your email to get a code instead.");
    }
  }, []);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) {
      setError(
        /rate limit/i.test(error.message)
          ? "Too many sign-in emails were sent. Wait a few minutes and try again, or use the last code you received."
          : error.message,
      );
      return;
    }
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: code.replace(/\D/g, ""),
      type: "email",
    });
    if (error) {
      setBusy(false);
      setError("That code didn't work. Check the newest email and enter its code, or send a new one.");
      return;
    }
    window.location.href = "/app";
  }

  return (
    <div className="wrap narrow">
      <header className="top">
        <a href="/" className="brand">Pay<span>Nudge</span></a>
      </header>
      <section className="panel">
        <h1 style={{ fontSize: "1.6rem" }}>Sign in or start your free trial</h1>

        {step === "email" ? (
          <form onSubmit={sendCode} style={{ display: "grid", gap: 12 }}>
            <div className="field">
              <label className="label" htmlFor="email">Work email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
            </div>
            <button className="primary" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Email me a sign-in code"}
            </button>
            {error && <p className="hint" style={{ color: "var(--bad)" }}>{error}</p>}
            <p className="hint">No password needed. New here? Your 14-day free trial starts when you first sign in.</p>
          </form>
        ) : (
          <form onSubmit={verify} style={{ display: "grid", gap: 12 }}>
            <p style={{ margin: 0 }}>
              We emailed a code to <b>{email}</b>. Enter it below, or click the link in the same email. Check spam if it isn&apos;t there in a minute.
            </p>
            <div className="field">
              <label className="label" htmlFor="code">Sign-in code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                style={{ fontFamily: "var(--f-mono)", fontSize: "1.3rem", letterSpacing: "0.2em" }}
              />
            </div>
            <button className="primary" type="submit" disabled={busy || code.replace(/\D/g, "").length < 6}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            {error && <p className="hint" style={{ color: "var(--bad)" }}>{error}</p>}
            <button type="button" className="ghost" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
              Use a different email or send a new code
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
