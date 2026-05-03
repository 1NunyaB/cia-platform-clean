"use client";

import { useEffect, useMemo, useState } from "react";

type CaseStatus =
  | "open_needs_evidence"
  | "open_has_evidence_needs_processing"
  | "closed";

type CaseItem = {
  id: string;
  caseCode: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
};

const CASES_STORAGE_KEY = "casefile_commons_cases";

const statusOptions: {
  value: CaseStatus;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    value: "open_needs_evidence",
    label: "Open, Needs Evidence",
    description: "Case exists, but evidence still needs to be added.",
    className: "border-[#2d7374]/40 bg-[#e8f4f4] text-[#1f5b5c]",
  },
  {
    value: "open_has_evidence_needs_processing",
    label: "Open, Has Evidence, Needs Processing",
    description: "Evidence exists and needs review, tagging, or analysis.",
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Case is closed for now and no longer active.",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
];

function getStatusOption(status: CaseStatus) {
  return (
    statusOptions.find((option) => option.value === status) || statusOptions[0]
  );
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `case_${Date.now()}`;
}

function createCaseCode(existingCases: CaseItem[]) {
  const nextNumber = existingCases.length + 1;
  return `CASE-${String(nextNumber).padStart(4, "0")}`;
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CaseStatus>("open_needs_evidence");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(CASES_STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as CaseItem[];

      if (Array.isArray(parsed)) {
        const normalized = parsed.map((item, index) => ({
          ...item,
          caseCode:
            item.caseCode || `CASE-${String(index + 1).padStart(4, "0")}`,
        }));

        setCases(normalized);
      }
    } catch {
      setCases([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  }, [cases]);

  const sortedCases = useMemo(() => {
    return [...cases].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cases]);

  function addCase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setMessage("Case Title Is Required.");
      return;
    }

    const newCase: CaseItem = {
      id: createId(),
      caseCode: createCaseCode(cases),
      title: cleanTitle,
      description: cleanDescription,
      status,
      createdAt: new Date().toISOString(),
    };

    setCases((current) => [newCase, ...current]);
    setTitle("");
    setDescription("");
    setStatus("open_needs_evidence");
    setMessage(`${newCase.caseCode} Added To Current Case List.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-[#d7e2e5] pb-6">
          <a href="/dashboard" className="text-sm font-semibold text-[#2d7374]">
            ← Back To Dashboard
          </a>
        </header>

        <section className="py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
            Cases
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35] sm:text-5xl">
            Master Case List
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#31465a] sm:text-lg">
            Add cases on the left and review the current case list on the right.
            Case IDs are assigned automatically.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#071d35]">
              Add Case
            </h2>

            <form onSubmit={addCase} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Case Title / Name
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Jeffrey Epstein Network"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Briefly explain what this case is tracking."
                  className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#cfdadd] bg-white px-4 py-3 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-[#071d35]">
                  Case Status
                </div>
                <p className="mt-1 text-sm text-[#31465a]">
                  New cases default to Open, Needs Evidence. Choose another
                  status before saving if needed.
                </p>

                <div className="mt-3 space-y-3">
                  {statusOptions.map((option) => {
                    const selected = status === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatus(option.value)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? `${option.className} ring-4 ring-[#2d7374]/10`
                            : "border-[#d7e2e5] bg-[#f7f9fa] text-[#31465a] hover:border-[#2d7374]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[#2d7374] bg-[#2d7374]"
                                : "border-[#9badb4] bg-white"
                            }`}
                          >
                            {selected ? (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ) : null}
                          </span>

                          <span>
                            <span className="block text-sm font-semibold">
                              {option.label}
                            </span>
                            <span className="mt-1 block text-xs leading-5 opacity-80">
                              {option.description}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="min-h-12 rounded-full bg-[#071d35] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
                >
                  Save Case
                </button>

                {message ? (
                  <span className="text-sm font-medium text-[#2d7374]">
                    {message}
                  </span>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#071d35]">
                  Current Case List
                </h2>
                <p className="mt-1 text-sm text-[#31465a]">
                  Case Title / Name, Case ID, and Status are shown together.
                </p>
              </div>

              <span className="rounded-full border border-[#d7e2e5] bg-[#f7f9fa] px-4 py-2 text-sm font-semibold text-[#31465a]">
                Total Cases: {cases.length}
              </span>
            </div>

            {sortedCases.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-[#cfdadd] bg-[#f7f9fa] p-8 text-center text-sm text-[#31465a]">
                No Cases Added Yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {sortedCases.map((item) => {
                  const statusOption = getStatusOption(item.status);

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#d7e2e5] bg-[#f7f9fa] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={`/cases/${item.id}`}
                            className="block truncate text-base font-semibold text-[#071d35] hover:text-[#2d7374]"
                          >
                            {item.title}
                          </a>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d7374]">
                            Case ID: {item.caseCode}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusOption.className}`}
                        >
                          {statusOption.label}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="mt-3 text-sm leading-6 text-[#31465a]">
                          {item.description}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}