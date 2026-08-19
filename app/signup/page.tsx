"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error ?? "Unable to create your account.");
      setSubmitting(false);
      return;
    }
    router.replace("/");
  }

  return <AuthLayout title="Create your account" subtitle="Your DevOS workspace stays private in this browser.">
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Full name</span>
        <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" autoComplete="name" className="h-11" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Email address</span>
        <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="h-11" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Password</span>
        <PasswordInput value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
      </label>
      <label className="block space-y-2 text-sm font-medium text-ink"><span>Confirm password</span>
        <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your password" autoComplete="new-password" />
      </label>
      <Button type="submit" disabled={submitting} className="h-11 w-full shadow-lg shadow-accent/20">{submitting ? "Creating account…" : "Create account"}</Button>
    </form>
    <p className="mt-6 text-center text-sm text-ink-muted">Already have an account? <Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link></p>
  </AuthLayout>;
}
