"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";

function Content() {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<"idle" | "qr" | "confirm" | "backup">("idle");
  const [qrData, setQrData] = useState<{ qr_code_url: string; secret: string; backup_codes: string[] } | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");

  const enableMutation = useMutation({
    mutationFn: () => profileApi.twoFactorEnable(""),
    onSuccess: (res) => { setQrData(res.data); setStep("qr"); },
  });

  const confirmMutation = useMutation({
    mutationFn: (c: string) => profileApi.twoFactorConfirm(c),
    onSuccess: () => { setStep("backup"); if (user) setUser({ ...user, totp_enabled: true }); },
  });

  const disableMutation = useMutation({
    mutationFn: () => profileApi.twoFactorDisable(pwForm.current),
    onSuccess: () => { setStep("idle"); if (user) setUser({ ...user, totp_enabled: false }); },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (d: any) => profileApi.changePassword(d),
    onSuccess: () => setPwMsg("Password changed successfully!"),
    onError: () => setPwMsg("Failed to change password."),
  });

  const copyBackup = (codes: string[]) => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Security</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Password and two-factor authentication settings</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">Change Password</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-sm">
            <Input type="password" placeholder="Current password" value={pwForm.current} onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))} />
            <Input type="password" placeholder="New password" value={pwForm.newPw} onChange={(e) => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
            <Input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
            {pwMsg && <p className={`text-xs ${pwMsg.includes("success") ? "text-green-700 dark:text-green-400" : "text-error"}`}>{pwMsg}</p>}
            <Button onClick={() => changePasswordMutation.mutate({ current_password: pwForm.current, password: pwForm.newPw, password_confirmation: pwForm.confirm })} disabled={changePasswordMutation.isPending}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Two-Factor Authentication
            </CardTitle>
            {user?.totp_enabled
              ? <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2 py-1 rounded-full">Enabled</span>
              : <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">Disabled</span>
            }
          </div>
        </CardHeader>
        <CardContent>
          {!user?.totp_enabled && step === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">Protect your account with a TOTP authenticator app like Google Authenticator or Authy.</p>
              <Button onClick={() => enableMutation.mutate()} disabled={enableMutation.isPending}><ShieldCheck className="w-4 h-4" /> Enable 2FA</Button>
            </div>
          )}

          {step === "qr" && qrData && (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">Scan this QR code with your authenticator app:</p>
              <img src={qrData.qr_code_url} alt="2FA QR Code" className="w-40 h-40 rounded-lg" />
              <p className="text-xs text-on-surface-variant">Or enter manually: <code className="text-primary">{qrData.secret}</code></p>
              <div className="flex gap-3 max-w-xs">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
                <Button onClick={() => confirmMutation.mutate(code)} disabled={code.length < 6 || confirmMutation.isPending}>Confirm</Button>
              </div>
            </div>
          )}

          {step === "backup" && qrData && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-on-surface">2FA Enabled! Save your backup codes:</p>
              <div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-xs grid grid-cols-2 gap-1 border border-outline-variant/20">
                {qrData.backup_codes.map((c, i) => <span key={i} className="text-on-surface-variant">{c}</span>)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => copyBackup(qrData.backup_codes)} size="sm">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Codes
                </Button>
                <Button onClick={() => setStep("idle")} size="sm">Done</Button>
              </div>
            </div>
          )}

          {user?.totp_enabled && step === "idle" && (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">2FA is active on your account.</p>
              <div className="flex gap-3 max-w-xs">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Confirm with TOTP code" maxLength={6} />
                <Button variant="destructive" onClick={() => disableMutation.mutate(code)} disabled={!code || disableMutation.isPending}><ShieldOff className="w-4 h-4" /> Disable</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SecurityPage() {
  return <Content />;
}
