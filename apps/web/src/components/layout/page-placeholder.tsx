// Temporary body for routes whose feature is not built yet.
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <main className="px-16 py-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Not built yet.</p>
    </main>
  );
}
