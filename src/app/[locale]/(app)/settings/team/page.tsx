"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/use-toast";
import { organizationApi, type Organization } from "@/api";
import { Users, UserPlus, Trash2, Loader2, Building2, Globe, Copy, Check } from "lucide-react";

function CreateOrg() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const create = useMutation({
    mutationFn: () => organizationApi.create(name.trim()),
    onSuccess: () => {
      toast.success("Agency workspace created.");
      qc.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not create workspace."),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-5 h-5 text-primary" /> Create your agency workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Manage multiple client websites with your team. Add up to <strong>5 domains</strong> and invite up to{" "}
          <strong>10 teammates</strong>, then assign each teammate the client domains they should see.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Agency" className="sm:max-w-xs" />
          <Button onClick={() => create.mutate()} disabled={!name.trim() || create.isPending} className="gap-2">
            {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            Create workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainPicker({ domains, selected, onToggle }: {
  domains: Organization["domains"]; selected: number[]; onToggle: (id: number) => void;
}) {
  if (!domains.length) return <p className="text-xs text-on-surface-variant">No domains yet — add one in Settings → Domains.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {domains.map((d) => {
        const on = selected.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onToggle(d.id)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
              on ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {on ? <Check className="w-3 h-3" /> : <Globe className="w-3 h-3" />} {d.domain}
          </button>
        );
      })}
    </div>
  );
}

function InviteForm({ org }: { org: Organization }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [domainIds, setDomainIds] = useState<number[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const full = org.seat_limit !== -1 && org.seats_used >= org.seat_limit;

  const invite = useMutation({
    mutationFn: () => organizationApi.invite({ email: email.trim(), role, domain_ids: domainIds }).then((r) => r.data),
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ["organization"] });
      setEmail(""); setDomainIds([]);
      if (d?.status === "invited" && d?.invite_url) {
        setInviteUrl(d.invite_url);
        toast.success("Invitation created. Share the link if the email doesn't arrive.");
      } else {
        toast.success("Member added.");
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not invite."),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="w-5 h-5 text-primary" /> Invite a teammate
          <span className="ml-auto text-xs font-normal text-on-surface-variant">{org.seats_used}/{org.seat_limit === -1 ? "∞" : org.seat_limit} seats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {full && <p className="text-sm text-amber-500">You&#39;ve used all your seats. Remove a member to invite another.</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@email.com" disabled={full} />
          <select value={role} onChange={(e) => setRole(e.target.value as any)} disabled={full}
            className="h-9 px-2 rounded-lg border border-outline-variant/40 bg-surface text-sm text-on-surface">
            <option value="member">Member (assigned domains)</option>
            <option value="admin">Admin (all domains + team)</option>
          </select>
        </div>
        {role === "member" && (
          <div>
            <p className="text-xs text-on-surface-variant mb-1.5">Domains this teammate can see</p>
            <DomainPicker domains={org.domains} selected={domainIds} onToggle={(id) => setDomainIds((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} />
          </div>
        )}
        <Button onClick={() => invite.mutate()} disabled={full || !email.trim() || invite.isPending} className="gap-2">
          {invite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Send invite
        </Button>
        {inviteUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-container p-2 text-xs">
            <code className="flex-1 truncate text-on-surface-variant">{inviteUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="text-primary hover:opacity-80">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MemberRow({ org, member }: { org: Organization; member: Organization["members"][number] }) {
  const qc = useQueryClient();
  const isOwner = member.role === "owner";

  const assign = useMutation({
    mutationFn: (ids: number[]) => organizationApi.assignDomains(member.user_id, ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organization"] }); toast.success("Domain access updated."); },
    onError: (e: any) => toast.error(e?.message ?? "Could not update."),
  });
  const remove = useMutation({
    mutationFn: () => organizationApi.removeMember(member.user_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organization"] }); toast.success("Member removed."); },
    onError: (e: any) => toast.error(e?.message ?? "Could not remove."),
  });

  const toggle = (id: number) => {
    const next = member.domain_ids.includes(id) ? member.domain_ids.filter((x) => x !== id) : [...member.domain_ids, id];
    assign.mutate(next);
  };

  return (
    <div className="py-3 border-b border-outline-variant/10 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {(member.name || member.email || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-on-surface truncate">{member.name || member.email}</p>
          <p className="text-xs text-on-surface-variant truncate">{member.email}</p>
        </div>
        <Badge variant={isOwner ? "success" : "secondary"} className="capitalize">{member.role}</Badge>
        {!isOwner && (
          <button onClick={() => { if (confirm("Remove this member?")) remove.mutate(); }} className="text-on-surface-variant hover:text-rose-400">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {member.role === "member" && (
        <div className="mt-2 ltr:pl-11 rtl:pr-11">
          <p className="text-[11px] text-on-surface-variant mb-1.5">Assigned domains {assign.isPending && <Loader2 className="inline w-3 h-3 animate-spin" />}</p>
          <DomainPicker domains={org.domains} selected={member.domain_ids} onToggle={toggle} />
        </div>
      )}
    </div>
  );
}

function Content() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: () => organizationApi.show().then((r) => r.data?.organization as Organization | null),
  });

  const cancelInvite = useMutation({
    mutationFn: (id: number) => organizationApi.cancelInvite(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organization"] }); toast.success("Invitation cancelled."); },
  });

  if (isLoading) return <div className="h-64 bg-surface-container rounded-xl animate-pulse" />;

  const org = data ?? null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Team
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Manage your agency workspace, teammates, and per-client domain access.</p>
      </div>

      {!org && <CreateOrg />}

      {org && !org.is_admin && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-on-surface">You&#39;re a member of <strong>{org.name}</strong>. You can access the domains assigned to you.</p>
          </CardContent>
        </Card>
      )}

      {org && org.is_admin && (
        <>
          <InviteForm org={org} />

          <Card>
            <CardHeader><CardTitle className="text-base">Members</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {org.members.map((m) => <MemberRow key={m.id} org={org} member={m} />)}
            </CardContent>
          </Card>

          {org.invitations.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Pending invitations</CardTitle></CardHeader>
              <CardContent className="pt-0">
                {org.invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
                    <span className="text-sm text-on-surface flex-1 truncate">{inv.email}</span>
                    <Badge variant="secondary" className="capitalize">{inv.role}</Badge>
                    <button onClick={() => cancelInvite.mutate(inv.id)} className="text-on-surface-variant hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function TeamPage() {
  return <Content />;
}
