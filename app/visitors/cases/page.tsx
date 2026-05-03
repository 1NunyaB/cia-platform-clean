export default function VisitorCasesPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <a href="/visitors" className="text-sm font-semibold text-[#2d7374]">
          ← Back To Visitor Access
        </a>

        <section className="mt-12">
          <h1 className="text-4xl font-semibold tracking-tight">
            Public Cases
          </h1>

          <p className="mt-4 max-w-2xl text-[#31465a]">
            Public case files will appear here for read-only viewing.
          </p>
        </section>
      </div>
    </main>
  );
}