"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");
    const result = updateProfile(name, email);
    if (!result.success) return setError(result.error ?? "Unable to update your profile.");
    setMessage("Profile updated successfully.");
  }

  return <main className="mx-auto max-w-3xl px-6 py-10">
    <div className="mb-8"><p className="text-xs uppercase tracking-[0.25em] text-ink-faint">Account</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">Profile</h1><p className="mt-3 text-sm text-ink-muted">Manage the identity shown across your DevOS workspace.</p></div>
    <Card className="border-base-border bg-base-raised"><CardContent className="p-6 sm:p-8">
      <div className="mb-7 flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent"><UserRound className="h-6 w-6" /></div><div><h2 className="font-semibold text-ink">Personal details</h2></div></div>
      <form onSubmit={save} className="space-y-5">
        {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {message && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{message}</p>}
        <label className="block space-y-2 text-sm font-medium text-ink">Full name<Input required value={name} onChange={(event) => setName(event.target.value)} className="h-11" /></label>
        <label className="block space-y-2 text-sm font-medium text-ink">Email<Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" /></label>
        <Button type="submit">Save changes</Button>
      </form>
    </CardContent></Card>
  </main>;
}
