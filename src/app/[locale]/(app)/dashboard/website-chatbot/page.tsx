import { MessageCircle } from "lucide-react";

export default function WebsiteChatbotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Website Chatbot</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">AI-powered chat widget for your visitors</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">Coming Soon</h2>
        <p className="text-on-surface-variant max-w-sm text-sm">
          The EYE website chatbot will allow you to engage visitors with AI-powered conversations, answer questions, and qualify leads automatically.
        </p>
        <div className="px-4 py-2 rounded-full border border-secondary/30 text-xs font-semibold text-secondary bg-secondary/5">
          Expected in a future release
        </div>
      </div>
    </div>
  );
}
