import {
  Bell,
  Download,
  Upload,
  Moon,
  Database,
  HardDrive,
  Palette,
  Shield,
  Trash2,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      {/* Header */}

      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          Preferences
        </p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Customize DevOS, manage your local data, browser notifications, and
          personalize your workspace. Everything stays on your device.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}

        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <Palette className="h-5 w-5 text-indigo-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">Appearance</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Customize how DevOS looks on your desktop.
                  </p>
                </div>
              </div>

              <Button variant="outline">
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}

        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">
                    Browser Notifications
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Get reminded about today's revisions, study goals and
                    learning streak.
                  </p>
                </div>
              </div>

              <Button>Enable</Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup */}

        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <Database className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">Backup & Restore</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Export your complete learning database as JSON or restore it
                    anytime.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>

                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}

        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <HardDrive className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">Local Storage</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    All your notes, topics, revisions and projects are stored
                    securely inside your browser using IndexedDB.
                  </p>
                </div>
              </div>

              <ChevronRight className="mt-2 h-5 w-5 text-zinc-600" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}

        <Card className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-zinc-900 p-3">
                  <Shield className="h-5 w-5 text-sky-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">Privacy</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    DevOS works completely offline. No backend. No cloud. No
                    account. Your data never leaves your computer.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger */}

        <Card className="border-red-900/40 bg-red-950/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="rounded-xl bg-red-950 p-3">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <h2 className="font-medium text-white">Reset DevOS</h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    Permanently delete all local data including learning topics,
                    revisions, notes, projects and analytics.
                  </p>
                </div>
              </div>

              <Button variant="destructive">Reset Everything</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
