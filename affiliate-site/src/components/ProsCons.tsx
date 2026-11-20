export function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  if (!pros.length && !cons.length) return null;
  return (
    <section aria-labelledby="pros-cons" className="mt-12">
      <h2 id="pros-cons" className="font-serif text-2xl font-bold sm:text-3xl">Pros & cons</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card border-t-4 border-t-brand-500 p-6">
          <p className="font-semibold text-brand-700">What we like</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {pros.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-0.5 font-bold text-brand-600">✓</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-t-4 border-t-red-400 p-6">
          <p className="font-semibold text-red-700">Watch out for</p>
          <ul className="mt-4 space-y-3 text-sm leading-6">
            {cons.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-0.5 font-bold text-red-500">✕</span><span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
