"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactApi } from "@/api/contact";

export default function ContactForm({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      subject: String(fd.get("subject") || "").trim(),
      body: String(fd.get("body") || "").trim(),
    };
    if (!data.name || !/^\S+@\S+\.\S+$/.test(data.email) || !data.subject || !data.body) {
      setError(ar ? "املأ الحقول المطلوبة ببريد صحيح." : "Fill the required fields with a valid email.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await contactApi.submit(data);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || (ar ? "تعذّر الإرسال. حاول مجددًا." : "Could not send. Try again."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="not-prose rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
        <Check className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
        <p className="font-bold text-on-surface">{ar ? "تم إرسال رسالتك!" : "Your message was sent!"}</p>
        <p className="text-sm text-on-surface-variant">{ar ? "سنردّ خلال يوم عمل." : "We'll reply within one business day."}</p>
      </div>
    );
  }

  const labelCls = "block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5";

  return (
    <form onSubmit={onSubmit} className="not-prose space-y-4 rounded-2xl border border-outline-variant/15 bg-surface/60 p-6">
      {error && <div className="rounded-lg bg-error-container/30 border border-error/20 px-4 py-3 text-sm text-error">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{ar ? "الاسم" : "Name"} *</label>
          <Input name="name" required placeholder={ar ? "اسمك" : "Your name"} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls}>{ar ? "البريد الإلكتروني" : "Email"} *</label>
          <Input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
        </div>
        <div>
          <label className={labelCls}>{ar ? "الهاتف" : "Phone"}</label>
          <Input name="phone" type="tel" placeholder="+20…" autoComplete="tel" />
        </div>
        <div>
          <label className={labelCls}>{ar ? "الموضوع" : "Subject"} *</label>
          <Input name="subject" required placeholder={ar ? "بخصوص…" : "About…"} />
        </div>
      </div>
      <div>
        <label className={labelCls}>{ar ? "الرسالة" : "Message"} *</label>
        <textarea
          name="body"
          required
          rows={5}
          maxLength={5000}
          placeholder={ar ? "كيف يمكننا مساعدتك؟" : "How can we help?"}
          className="flex w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-base sm:text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 gap-2 sm:w-auto sm:px-8">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {ar ? "إرسال" : "Send message"}
      </Button>
    </form>
  );
}
