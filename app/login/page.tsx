"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(searchParams.get("next") || "/");
  }, [loading, router, searchParams, user]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = login(email, password, rememberMe);
    if (!result.success) {
      setError(result.error ?? "Unable to sign in.");
      setSubmitting(false);
      return;
    }
    router.replace(searchParams.get("next") || "/");
  }

  return <AuthLayout title="Welcome back" subtitle="Sign in to continue to your developer workspace.">
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Email address</span>
        <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="h-11" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Password</span>
        <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-base-border accent-accent" /> <span>Remember me on this device</span></label>
      <Button type="submit" disabled={submitting} className="h-11 w-full shadow-lg shadow-accent/20">{submitting ? "Signing in…" : "Sign in to DevOS"}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-ink-muted">New to DevOS? <Link href="/signup" className="font-medium text-accent hover:underline">Create an account</Link></p>
  </AuthLayout>;
}
