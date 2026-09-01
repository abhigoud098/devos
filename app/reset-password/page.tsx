"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { KeyRound, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { api } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Password reset token is missing or invalid.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.resetPassword(token, password);

      if (res.data?.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to reset password. The link may be expired.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-base-border/80 bg-card p-6 sm:p-8 shadow-xl text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-high/10 text-signal-high">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Password reset successfully</h2>
          <p className="text-xs text-ink-muted mt-2">
            Your DevOS account password has been updated. You can now log in with your new password.
          </p>
        </div>

        <Button
          onClick={() => router.push("/login")}
          className="w-full h-10 text-xs font-semibold shadow-md shadow-accent/15"
        >
          Go to Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-base-border/80 bg-card p-6 sm:p-8 shadow-xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Reset Password</h1>
        <p className="text-xs text-ink-muted">
          Create a new strong password for your DevOS account.
        </p>
      </div>

      {!token && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>No reset token provided. Please use the link sent to your email.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink">New Password</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink">Confirm Password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !token}
          className="w-full h-10 text-xs font-semibold shadow-md shadow-accent/15 gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="pt-2 text-center border-t border-base-border/50">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-accent" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
