"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Globe, CreditCard, User, Shield, Bell, Webhook, Settings,
  CheckCircle, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domainsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  href, icon: Icon, label, desc, color = "text-on-surface-variant", badge,
}: {
  href: string; icon: React.ElementType; label: string; desc: string;
  color?: string; badge?: string;
}) {
  const locale = useLocale();
  const bgClass =
    color.includes("sky")     ? "bg-sky-400/10" :
    color.includes("emerald") ? "bg-emerald-400/10" :
    color.includes("rose")    ? "bg-rose-400/10" :
    color.includes("amber")   ? "bg-amber-400/10" :
    color.includes("violet")  ? "bg-violet-400/10" :
    color.includes("primary") ? "bg-primary/10" :
    "bg-surface-container-high";

  return (
    <Link href={`/${locale}${href}`}>
      <div className="group relative flex flex-col gap-2 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/30 hover:bg-surface-container/60 hover:border-outline-variant/40 hover:shadow-md transition-all cursor-pointer h-full">
        {badge && (
          <span className="absolute top-3 ltr:right-3 rtl:left-3 text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <p className="text-sm font-bold text-on-surface leading-tight">{label}</p>
        <p className="text-[11px] text-on-surface-variant leading-snug">{desc}</p>
      </div>
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function Content() {
  const th = useTranslations("hubs.settings");
  const { user } = useAuthStore();
  const locale = useLocale();

  const { data: domainsData } = useQuery({
    queryKey: ["domains-list"],
    queryFn: () => domainsApi.list().then((r) => r.data),
  });

  const domains: { id: number; domain: string; is_active: boolean }[] =
    Array.isArray(domainsData?.domains) ? domainsData.domains :
    Array.isArray(domainsData)          ? domainsData : [];

  const FEATURES = [
    { href: "/settings/domains",       icon: Globe,     label: th("domains" as never)       || "My Websites",        desc: th("domainsDesc" as never)       || "Add & configure websites",                       color: "text-primary"    },
    { href: "/settings/billing",       icon: CreditCard,label: th("billing" as never)       || "Plans & Billing",    desc: th("billingDesc" as never)       || "Subscription plans & payment history",           color: "text-emerald-400"},
    { href: "/settings/profile",       icon: User,      label: th("profile" as never)       || "Profile",            desc: th("profileDesc" as never)       || "Name, email, and avatar",                        color: "text-sky-400"    },
    { href: "/settings/security",      icon: Shield,    label: th("security" as never)      || "Security",           desc: th("securityDesc" as never)      || "Password & two-factor authentication",            color: "text-rose-400"   },
    { href: "/settings/alerts",        icon: Bell,      label: th("alerts" as never)        || "Alerts",             desc: th("alertsDesc" as never)        || "Traffic spike and anomaly alerts",                color: "text-amber-400"  },
    { href: "/settings/webhooks",      icon: Webhook,   label: th("webhooks" as never)      || "Webhooks",           desc: th("webhooksDesc" as never)      || "Push data to other applications",                 color: "text-violet-400" },
    { href: "/settings/notifications", icon: Bell,      label: th("notifications" as never) || "Notifications",      desc: th("notificationsDesc" as never) || "Email & push notification preferences",           color: "text-teal-400"   },
  ];

  return (
    <div className="space-y-6">
      {/* Hub header */}
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-on-surface-variant" />
          {th("title" as never) || "Settings"}
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          {th("description" as never) || "Manage your account, connected websites, billing, and integrations."}
        </p>
      </div>

      {/* Account summary card */}
      {user && (
        <Card className="bg-gradient-to-br from-surface-container to-surface-container-high border-outline-variant/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-primary">
                {user.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-on-surface">{user.name}</p>
              <p className="text-sm text-on-surface-variant">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className="bg-primary/15 text-primary text-[10px] font-bold border-0">
                  {(user as { plan?: string }).plan ?? "Free"}
                </Badge>
                {user.email_verified_at ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle className="w-3 h-3" /> {th("emailVerified" as never)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> {th("emailNotVerified" as never)}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}/settings/profile`}
              className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline shrink-0"
            >
              Edit profile <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Connected websites */}
      {domains.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/20 bg-surface-container/30">
          <Globe className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">{th("connectedWebsites" as never)}: {domains.length}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {domains.map((d) => d.domain).slice(0, 3).join(", ")}
              {domains.length > 3 ? ` +${domains.length - 3} more` : ""}
            </p>
          </div>
          <Link href={`/${locale}/settings/domains`} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline shrink-0">
            Manage <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Feature cards grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
          {th("features" as never) || "Quick Access"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.href} {...f} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsHubPage() {
  return <Content />;
}
