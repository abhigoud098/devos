"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export const dynamic = "force-dynamic";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { KeyRound, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.forgotPassword(trimmed);
      if (res.data?.success) {
        setSuccessMsg(
          res.data.message || "If the email is registered, a password reset link has been sent.",
        );
      } else {
        setError(res.error || "Unable to send reset link. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your registered email address and we'll send you a link to reset your password."
    >
      {successMsg ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-high/10 text-signal-high">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Check your inbox</h3>
            <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">{successMsg}</p>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full h-10 text-xs">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <label className="block space-y-2 text-sm font-medium text-ink">
            <span>Email address</span>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11"
            />
          </label>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full shadow-lg shadow-accent/20 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
