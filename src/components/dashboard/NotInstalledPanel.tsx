"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { domainsApi } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { eyeTrack } from "@/lib/track";
import { Copy, Check, Loader2, Mail, CheckCircle2, Code2 } from "lucide-react";

/**
 * Shown in place of the KPIs when a domain has never sent an event.
 *
 * The dashboard used to render Visitors 0 / Sessions 0 / Bounce 0% with no
 * explanation, which reads as a broken product rather than as an unfinished
 * setup — and the free audit in signup runs on a URL alone, so people arrive
 * genuinely believing tracking is already live. Zeros are not data; until the
 * snippet is on the site there is nothing to show, so this says the remaining
 * step instead of pretending to report on it.
 *
 * Deliberately not dismissible: the one prompt that existed (WelcomeChecklist)
 * could be dismissed permanently, after which nothing in the dashboard
 * mentioned installing at all.
 */
export default function NotInstalledPanel({
  domainId,
  domainName,
  scriptToken,
}: {
  domainId: number;
  domainName: string;
  scriptToken: string;
}) {
  const locale = useLocale();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [mailing, setMailing] = useState(false);
  const [mailed, setMailed] = useState(false);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://eye-analysis.online").replace(/\/$/, "");
  const snippet = `<script src="${appUrl}/tracker/eye.js" data-token="${scriptToken}" data-api="${appUrl}/api/collect" async></script>`;

  const verify = async () => {
    setVerifying(true);
    eyeTrack("install_verify_clicked", { domain: domainName });
    try {
      const r = await domainsApi.verify(domainId);
      const ok = !!(r.data?.verified ?? r.data?.data?.verified);
      if (ok) {
        toast.success("Installed — data will appear within a minute.");
        qc.invalidateQueries({ queryKey: ["overview"] });
        qc.invalidateQueries({ queryKey: ["domains"] });
      } else {
        toast.error("No data received yet. Paste the snippet, load your site once, then check again.");
      }
    } catch {
      toast.error("Couldn't check right now — try again in a moment.");
    } finally {
      setVerifying(false);
    }
  };

  const emailToMe = async () => {
    setMailing(true);
    try {
      await domainsApi.sendInstallEmail(domainId);
      setMailed(true);
      toast.success("Install instructions sent to your email.");
    } catch {
      toast.error("Couldn't send the email. Please try again.");
    } finally {
      setMailing(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">One step left for {domainName}</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              We haven&apos;t received any visitors from this site yet. EYE only sees visitors once this
              snippet is on your pages — add it just before the closing <code className="font-mono">&lt;/head&gt;</code> tag.
            </p>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-surface-container-lowest rounded-lg p-3 pe-12 text-xs text-on-surface-variant overflow-x-auto border border-outline-variant/20 font-mono">
            {snippet}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(snippet);
              setCopied(true);
              eyeTrack("install_snippet_copied", { domain: domainName });
              setTimeout(() => setCopied(false), 2000);
            }}
            title="Copy snippet"
            className="absolute top-2 end-2 p-1.5 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={verify} disabled={verifying} className="gap-1.5">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify installation
          </Button>
          {/* Most signups happen on a phone, where pasting into <head> is not
              possible and mailto: does nothing inside in-app browsers. */}
          <Button variant="outline" onClick={emailToMe} disabled={mailing || mailed} className="gap-1.5">
            {mailing ? <Loader2 className="w-4 h-4 animate-spin" /> : mailed ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Mail className="w-4 h-4" />}
            {mailed ? "Sent to your inbox" : "Email this to me"}
          </Button>
          <Link
            href={`/${locale}/settings/domains`}
            className="text-sm font-medium text-on-surface-variant hover:text-primary px-2 py-1.5 rounded-lg hover:bg-surface-container"
          >
            WordPress, Shopify &amp; other platforms
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
