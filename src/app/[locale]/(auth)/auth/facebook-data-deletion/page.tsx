"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { CheckCircle2 } from "lucide-react";

// Status page linked from FacebookController::dataDeletion()'s `url` field —
// shown to a user who asked Facebook to delete the data our app got via
// Facebook Login. We drop facebook_id synchronously on that callback, so by
// the time anyone opens this link the request is already done.
export default function FacebookDataDeletionStatusPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const params = useSearchParams();
  const code = params.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5">
      <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high p-10 text-center shadow-xl max-w-md">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
        <p className="text-base font-semibold text-on-surface mb-1">
          {ar ? "تم حذف بيانات فيسبوك الخاصة بك" : "Your Facebook data has been deleted"}
        </p>
        <p className="text-sm text-on-surface-variant">
          {ar
            ? "أزلنا ربط حساب فيسبوك بحسابك على EYE. حسابك نفسه — إن وُجد — يبقى كما هو."
            : "We've unlinked your Facebook account from EYE. Your EYE account itself, if any, remains untouched."}
        </p>
        {code && (
          <p className="text-[11px] text-on-surface-variant/60 mt-4 font-mono">
            {ar ? "رمز التأكيد" : "Confirmation code"}: {code}
          </p>
        )}
      </div>
    </div>
  );
}
