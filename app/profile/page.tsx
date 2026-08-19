"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserRound, Mail, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name.");

    setLoading(true);
    const result = await updateProfile(name, email);
    setLoading(false);

    if (!result.success) return setError(result.error ?? "Unable to update your profile.");
    setMessage("Profile updated successfully.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. PAGE HEADER */}
      <PageHeader
        kicker="Account Management"
        title="Developer Profile"
        description="Manage the identity and email associated with your DevOS workspace."
      />

      {/* 2. PROFILE CARD */}
      <Card className="border-base-border/80 bg-card">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-base-border/70">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-2 ring-accent/20">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">{user?.name || "Developer"}</h2>
              <p className="text-xs text-ink-muted">{user?.email || "developer@devos.local"}</p>
            </div>
          </div>

          <form onSubmit={save} className="space-y-5 max-w-xl">
            {error && (
              <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div role="status" className="flex items-center gap-2 rounded-xl border border-signal-high/30 bg-signal-high/10 px-4 py-3 text-xs text-signal-high font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Full Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-base-raised"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Email Address</label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-base-raised"
              />
            </div>

            <Button type="submit" disabled={loading} className="gap-1.5 shadow-md shadow-accent/20">
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
