const dashboardLinks = [
  {
    title: "Add Evidence",
    description: "Upload or enter new evidence into the system.",
    href: "/evidence/add",
  },
  {
    title: "Look at Evidence",
    description: "Open the evidence library and review saved files.",
    href: "/evidence",
  },
  {
    title: "Process Evidence",
    description: "Work through evidence that needs review, tagging, or analysis.",
    href: "/evidence/process",
  },
  {
    title: "Look at Timelines",
    description: "Review timelines connected to cases and evidence.",
    href: "/timelines",
  },
  {
    title: "Create / View / Work on Cases",
    description: "Open case files, create new cases, and continue case work.",
    href: "/cases",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7e2e5] pb-6">
          <a href="/" className="text-sm font-semibold text-[#2d7374]">
            ← Back to Landing Page
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

        <section className="py-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
            Dashboard
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35] sm:text-5xl">
            Welcome to Casefile Commons
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#31465a] sm:text-lg">
            Choose where you want to work. Each section keeps cases, evidence,
            timelines, and review tasks organized.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dashboardLinks.map((item) => (
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

        <section className="mt-12 rounded-3xl border border-[#d7e2e5] bg-white p-6 text-center text-sm leading-6 text-[#31465a] shadow-sm">
          <p>
            Please share the site. Podcasters, commentators, investigators,
            researchers, and viewers can help organize public information,
            connect evidence, and build clearer timelines.
          </p>
        </section>
      </div>
    </main>
  );
}