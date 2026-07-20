// Routed pages scroll within their own container (the app shell is a fixed
// viewport height). flex-1 + min-h-0 lets it fill <main> and scroll internally.
export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 overflow-y-auto min-h-0">
      <div className="mx-auto max-w-5xl px-6 py-16">{children}</div>
    </div>
  );
}
