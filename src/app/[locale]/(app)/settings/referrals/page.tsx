"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { Gift, Copy, Check, Clock, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { referralsApi, type ReferralRow } from "@/api/referrals";

function Content() {
  const ar = useLocale() === "ar";
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["referrals"],
    queryFn: () => referralsApi.mine().then((r) => r.data?.data ?? r.data),
  });

  const shareUrl: string = data?.share_url ?? "";
  const rewardDays: number = data?.reward_days ?? 14;
  const referrals: ReferralRow[] = data?.referrals ?? [];

  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    ar
      ? `جرّب EYE Analytics — تحليلات مواقع بدون كوكيز وبدون تعقيد. سجّل من هنا: ${shareUrl}`
      : `Try EYE Analytics — privacy-first website analytics, no cookie banner. Sign up here: ${shareUrl}`
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" /> {ar ? "ادعُ واكسب" : "Invite & Earn"}
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          {ar
            ? `كل صديق يسجّل من رابطك ويربط موقعه، يحصل كلاكما على ${rewardDays} يوماً إضافياً في التجربة المجانية.`
            : `Every friend who signs up with your link and connects a site gives you both ${rewardDays} extra trial days.`}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface">{ar ? "رابط الدعوة الخاص بك" : "Your invite link"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="h-10 flex-1 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm text-on-surface-variant"
            />
            <button
              onClick={copy}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-bold text-on-primary hover:opacity-90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? (ar ? "تم النسخ" : "Copied") : (ar ? "نسخ" : "Copy")}
            </button>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
          >
            {ar ? "شارك عبر واتساب" : "Share on WhatsApp"}
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-on-surface">{ar ? "دعواتك" : "Your invites"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && <div className="p-6 text-sm text-on-surface-variant">{ar ? "جارِ التحميل…" : "Loading…"}</div>}
          {!isLoading && referrals.length === 0 && (
            <div className="p-8 text-center text-sm text-on-surface-variant">
              {ar ? "لا دعوات بعد — شارك رابطك أعلاه." : "No invites yet — share your link above."}
            </div>
          )}
          <div className="divide-y divide-outline-variant/10">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">{r.name || r.email}</p>
                  <p className="truncate text-xs text-on-surface-variant">{r.email}</p>
                </div>
                {r.status === "rewarded" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <PartyPopper className="h-3 w-3" /> {ar ? "تمت المكافأة" : "Rewarded"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                    <Clock className="h-3 w-3" /> {ar ? "قيد الانتظار" : "Pending"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReferralsPage() {
  return <Content />;
}
