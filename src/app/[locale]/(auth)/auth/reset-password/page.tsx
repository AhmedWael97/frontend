"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

const schema = z.object({
  password: z.string().min(8),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, email, ...data });
      router.push(`/${locale}/auth/login`);
    } catch (e: any) {
      setError(e.response?.data?.message || "Reset failed. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Set new password</h1>
        <p className="text-on-surface-variant text-sm mt-1.5">Choose a strong password for your account.</p>
      </div>

      <div className="glass-card rounded-xl p-8 shadow-2xl border border-outline-variant/15">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
            <Input type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm Password</label>
            <Input type="password" placeholder="••••••••" {...register("password_confirmation")} />
            {errors.password_confirmation && <p className="text-xs text-error ml-1">{errors.password_confirmation.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
