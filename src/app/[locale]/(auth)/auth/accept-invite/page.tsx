"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { CheckCircle, AlertCircle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { organizationApi } from "@/api";
import { useAuthStore } from "@/store/auth";

function AcceptInviteContent() {
  const params = useSearchParams();
  const locale = useLocale();
  const token = params.get("token") || "";
  const { token: authToken } = useAuthStore();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !authToken) return; // need to be logged in to accept
    setState("loading");
    organizationApi
      .acceptInvite(token)
      .then(() => { setState("ok"); setMessage("You've joined the team!"); })
      .catch((e: any) => { setState("error"); setMessage(e?.message ?? "This invitation is invalid or expired."); });
  }, [token, authToken]);

  return (
    <div className="w-full max-w-md text-center">
      <div className="glass-card rounded-xl p-10 shadow-2xl border border-outline-variant/15 space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          {state === "ok" ? <CheckCircle className="w-8 h-8 text-emerald-500" />
            : state === "error" ? <AlertCircle className="w-8 h-8 text-rose-500" />
            : <Users className="w-8 h-8 text-primary" />}
        </div>

        {!token ? (
          <p className="text-on-surface-variant text-sm">No invitation token found.</p>
        ) : !authToken ? (
          <>
            <h1 className="text-2xl font-bold text-on-surface">You&#39;re invited to a team</h1>
            <p className="text-on-surface-variant text-sm">
              Log in, or register with the invited email address — you&#39;ll be added to the team automatically.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href={`/${locale}/auth/login`}><Button variant="outline">Log in</Button></Link>
              <Link href={`/${locale}/auth/register`}><Button>Create account</Button></Link>
            </div>
          </>
        ) : state === "loading" || state === "idle" ? (
          <p className="text-on-surface-variant text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Joining the team…
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-on-surface">{state === "ok" ? "Welcome aboard!" : "Couldn't join"}</h1>
            <p className="text-on-surface-variant text-sm">{message}</p>
            <Link href={`/${locale}/dashboard`}><Button>Go to dashboard</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}
