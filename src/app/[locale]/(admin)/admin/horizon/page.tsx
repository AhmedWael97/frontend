export default function AdminHorizonPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-on-surface tracking-tight">Horizon</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Laravel Horizon queue dashboard</p>
      </div>
      <div className="rounded-xl overflow-hidden border border-outline-variant/20" style={{ height: "calc(100vh - 180px)" }}>
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost"}/horizon`}
          className="w-full h-full"
          title="Laravel Horizon"
        />
      </div>
    </div>
  );
}
