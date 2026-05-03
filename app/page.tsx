export default function HomePage() {
  const openCases = [
    "Jeffrey Epstein Network",
    "Public Records Review",
    "Institutional Accountability",
    "Timeline Reconstruction",
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-[#d7e2e5] bg-white shadow-sm">
              <div className="relative h-16 w-16">
                <div className="absolute left-1 top-2 h-11 w-12 rounded-xl bg-[#071d35]" />
                <div className="absolute left-4 top-0 h-4 w-8 rounded-t-lg bg-[#2d7374]" />
                <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#071d35] shadow-md">
                  <div className="h-3 w-3 rounded-full bg-[#2d7374]" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight text-[#071d35] sm:text-6xl">
              Casefile <span className="text-[#2d7374]">Commons</span>
            </h1>
          </div>

          <p className="max-w-2xl text-base leading-7 text-[#31465a] sm:text-lg">
            A public investigation workspace for organizing open cases, evidence
            files, timelines, and research leads in one place.
          </p>

          <form className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="min-h-12 flex-1 rounded-full border border-[#cfdadd] bg-white px-5 text-sm text-[#071d35] shadow-sm outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
            />
            <button
              type="submit"
              className="min-h-12 rounded-full bg-[#071d35] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
            >
              Continue
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/visitors"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2d7374] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#235d5e]"
            >
              Continue as Visitor
            </a>

            <a
              href="https://buymeacoffee.com/NunyaB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#2d7374]/30 bg-white px-6 text-sm font-semibold text-[#2d7374] shadow-sm transition hover:border-[#2d7374] hover:bg-[#eef6f6]"
            >
              Support &amp; Message
            </a>
</div>
        </section>

        <section className="border-t border-[#d7e2e5] py-4">
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-flex gap-8 text-sm font-medium text-[#31465a]">
              {openCases.map((title) => (
                <span key={title}>Open Case: {title}</span>
              ))}
              <span>Evidence files processing: 128</span>
              <span>Members processing: 24</span>

              {openCases.map((title) => (
                <span key={`${title}-repeat`}>Open Case: {title}</span>
              ))}
              <span>Evidence files processing: 128</span>
              <span>Members processing: 24</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}