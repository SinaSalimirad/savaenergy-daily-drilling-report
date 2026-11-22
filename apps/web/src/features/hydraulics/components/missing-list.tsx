/** What the calculation still lacks, so the user knows which page to fill. */
export function MissingList({ missing }: { missing: string[] }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="font-medium">
        This report cannot be calculated yet. It still needs:
      </p>
      <ul className="mt-2 list-disc pl-6 text-muted-foreground">
        {missing.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
