"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Small "How it works" button that opens a dialog explaining a page/feature.
 * Reusable across dashboard pages — pass a title and rich content as children.
 */
export function HelpDialog({
  title,
  label = "How it works",
  children,
}: {
  title: string;
  label?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors shrink-0"
      >
        <HelpCircle className="w-3.5 h-3.5" /> {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" /> {title}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-on-surface-variant space-y-4 leading-relaxed [&_strong]:text-on-surface [&_code]:text-primary [&_code]:text-xs [&_code]:bg-surface-container [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
