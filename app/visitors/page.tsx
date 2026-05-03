const visitorLinks = [
  {
    title: "View Cases",
    description: "Browse public case files without editing or uploading.",
    href: "/visitors/cases",
  },
  {
    title: "View Evidence Library",
    description: "Review public evidence records, documents, and file summaries.",
    href: "/visitors/evidence",
  },
  {
    title: "View Timelines",
    description: "Follow public timelines built from linked evidence and case notes.",
    href: "/visitors/timelines",
  },
];

export default function VisitorsPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-[#d7e2e5] pb-6">
          <a href="/" className="text-sm font-semibold text-[#2d7374]">
            ← Casefile Commons
          </a>

          <a
            href="https://buymeacoffee.com/1NunyaB"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#2d7374]/30 bg-white px-5 py-2 text-sm font-semibold text-[#2d7374] shadow-sm transition hover:border-[#2d7374] hover:bg-[#eef6f6]"
          >
            Support &amp; Message
          </a>
        </header>

        <section className="py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
            Visitor Access
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35] sm:text-5xl">
            Public view-only workspace
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#31465a] sm:text-lg">
            Visitors can view public cases, evidence libraries, and timelines.
            Editing, uploading, processing, and case management tools are reserved
            for members.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {visitorLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#2d7374]/50 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-[#071d35]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#31465a]">
                {item.description}
              </p>
              <p className="mt-6 text-sm font-semibold text-[#2d7374]">
                Open →
              </p>
            </a>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-[#d7e2e5] bg-white p-6 text-sm leading-6 text-[#31465a] shadow-sm">
          <p>
            Visitor pages are read-only by design. Public viewers can review
            information, share the site, and support the project, but they will
            not see upload, edit, delete, process, or admin controls.
          </p>
        </section>
      </div>
    </main>
  );
}