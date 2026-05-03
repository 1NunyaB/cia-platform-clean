"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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

type LinkedEvidenceItem = {
  id: string;
  evidenceCode: string;
  title: string;
  evidenceType: string;
  status: string;
  linkedCaseId: string;
  notes?: string;
};

type LinkedIncidentItem = {
  id: string;
  incidentCode: string;
  title: string;
  incidentDate?: string;
  location?: string;
  linkedCaseId: string;
  summary?: string;
};

const CASES_STORAGE_KEY = "casefile_commons_cases";
const EVIDENCE_STORAGE_KEY = "casefile_commons_evidence";
const INCIDENTS_STORAGE_KEY = "casefile_commons_incidents";

const statusOptions: {
  value: CaseStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "open_needs_evidence",
    label: "Open, Needs Evidence",
    className: "border-[#2d7374]/40 bg-[#e8f4f4] text-[#1f5b5c]",
  },
  {
    value: "open_has_evidence_needs_processing",
    label: "Open, Has Evidence, Needs Processing",
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "closed",
    label: "Closed",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
];

function getStatusOption(status: CaseStatus) {
  return (
    statusOptions.find((option) => option.value === status) || statusOptions[0]
  );
}

function loadArrayFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  const saved = window.localStorage.getItem(key);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function CaseWorkspacePage() {
  const params = useParams<{ caseId: string }>();
  const caseId = params.caseId;

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [evidence, setEvidence] = useState<LinkedEvidenceItem[]>([]);
  const [incidents, setIncidents] = useState<LinkedIncidentItem[]>([]);
  const [activeStack, setActiveStack] = useState<"evidence" | "incidents" | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setCases(loadArrayFromStorage<CaseItem>(CASES_STORAGE_KEY));
    setEvidence(loadArrayFromStorage<LinkedEvidenceItem>(EVIDENCE_STORAGE_KEY));
    setIncidents(loadArrayFromStorage<LinkedIncidentItem>(INCIDENTS_STORAGE_KEY));
  }, []);

  const currentCase = useMemo(() => {
    return cases.find((item) => item.id === caseId) || null;
  }, [cases, caseId]);

  const linkedEvidence = useMemo(() => {
    return evidence.filter((item) => item.linkedCaseId === caseId);
  }, [evidence, caseId]);

  const linkedIncidents = useMemo(() => {
    return incidents.filter((item) => item.linkedCaseId === caseId);
  }, [incidents, caseId]);

  const activeItems = activeStack === "evidence" ? linkedEvidence : linkedIncidents;
  const activeItem = activeItems[activeIndex] || null;

  function openStack(type: "evidence" | "incidents", index: number) {
    setActiveStack(type);
    setActiveIndex(index);
  }

  function closeStack() {
    setActiveStack(null);
    setActiveIndex(0);
  }

  function showPreviousCard() {
    setActiveIndex((current) =>
      current === 0 ? activeItems.length - 1 : current - 1
    );
  }

  function showNextCard() {
    setActiveIndex((current) =>
      current === activeItems.length - 1 ? 0 : current + 1
    );
  }

  if (!currentCase) {
    return (
      <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
        <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
          <header className="border-b border-[#d7e2e5] pb-6">
            <a href="/cases" className="text-sm font-semibold text-[#2d7374]">
              ← Back To Master Case List
            </a>
          </header>

          <section className="py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
              Case Workspace
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35]">
              Case Not Found
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#31465a]">
              This case may not exist yet, or it may not be saved in this
              browser. Return to the Master Case List and select a saved case.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const statusOption = getStatusOption(currentCase.status);

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7e2e5] pb-6">
          <a href="/cases" className="text-sm font-semibold text-[#2d7374]">
            ← Back To Master Case List
          </a>

          <a href="/dashboard" className="text-sm font-semibold text-[#2d7374]">
            Back To Dashboard →
          </a>
        </header>

        <section className="py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
            Case Workspace
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35] sm:text-5xl">
            {currentCase.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-[#2d7374]/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d7374]">
              Case ID: {currentCase.caseCode}
            </span>

            <span
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${statusOption.className}`}
            >
              {statusOption.label}
            </span>
          </div>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#31465a] sm:text-lg">
            {currentCase.description || "No case description has been added."}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-semibold text-[#071d35]">
              {linkedEvidence.length}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#31465a]">
              Linked Evidence
            </p>
          </div>

          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-semibold text-[#071d35]">
              {linkedIncidents.length}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#31465a]">
              Linked Incidents
            </p>
          </div>

          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-semibold text-[#071d35]">0</p>
            <p className="mt-2 text-sm font-semibold text-[#31465a]">
              Timeline Events
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#071d35]">
                  Linked Evidence
                </h2>
                <p className="mt-1 text-sm text-[#31465a]">
                  Click an evidence record to open the evidence card stack.
                </p>
              </div>

              <a
                href="/evidence/add"
                className="rounded-full bg-[#071d35] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
              >
                Add Evidence
              </a>
            </div>

            {linkedEvidence.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-[#cfdadd] bg-[#f7f9fa] p-8 text-center text-sm text-[#31465a]">
                No linked evidence yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {linkedEvidence.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openStack("evidence", index)}
                    className="w-full rounded-2xl border border-[#d7e2e5] bg-[#f7f9fa] p-4 text-left transition hover:border-[#2d7374]/50 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#071d35]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d7374]">
                          {item.evidenceCode}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#d7e2e5] bg-white px-3 py-1 text-xs font-semibold text-[#31465a]">
                        {item.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#071d35]">
                  Linked Incidents
                </h2>
                <p className="mt-1 text-sm text-[#31465a]">
                  Click an incident to open the incident card stack.
                </p>
              </div>

              <a
                href="/incidents"
                className="rounded-full bg-[#071d35] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
              >
                Add Incident
              </a>
            </div>

            {linkedIncidents.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-[#cfdadd] bg-[#f7f9fa] p-8 text-center text-sm text-[#31465a]">
                No linked incidents yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {linkedIncidents.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openStack("incidents", index)}
                    className="w-full rounded-2xl border border-[#d7e2e5] bg-[#f7f9fa] p-4 text-left transition hover:border-[#2d7374]/50 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#071d35]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d7374]">
                          {item.incidentCode}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#d7e2e5] bg-white px-3 py-1 text-xs font-semibold text-[#31465a]">
                        {item.incidentDate || "Date Not Added"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#071d35]">
                Timeline Preview
              </h2>
              <p className="mt-1 text-sm text-[#31465a]">
                Timeline events connected to this case will appear here later.
              </p>
            </div>

            <a
              href="/timelines"
              className="rounded-full bg-[#071d35] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
            >
              Open Timelines
            </a>
          </div>

          <div className="mt-5 rounded-3xl border border-dashed border-[#cfdadd] bg-[#f7f9fa] p-8 text-center text-sm text-[#31465a]">
            No timeline events linked yet.
          </div>
        </section>
      </div>

      {activeStack && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071d35]/70 px-6 py-8">
          <div className="relative w-full max-w-2xl">
            <div className="absolute left-6 top-6 h-full w-full rotate-3 rounded-3xl bg-white/40" />
            <div className="absolute left-3 top-3 h-full w-full rotate-1 rounded-3xl bg-white/60" />

            <section className="relative rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
                    {activeStack === "evidence"
                      ? "Evidence Card Stack"
                      : "Incident Card Stack"}
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold text-[#071d35]">
                    {"evidenceCode" in activeItem
                      ? activeItem.title
                      : activeItem.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeStack}
                  className="rounded-full border border-[#d7e2e5] bg-[#f7f9fa] px-4 py-2 text-sm font-semibold text-[#071d35] transition hover:bg-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-6 text-[#31465a]">
                {"evidenceCode" in activeItem ? (
                  <>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Evidence ID:
                      </span>{" "}
                      {activeItem.evidenceCode}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Type:
                      </span>{" "}
                      {activeItem.evidenceType}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Status:
                      </span>{" "}
                      {activeItem.status}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Notes:
                      </span>{" "}
                      {activeItem.notes || "No notes added."}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Incident ID:
                      </span>{" "}
                      {activeItem.incidentCode}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Date:
                      </span>{" "}
                      {activeItem.incidentDate || "Date not added."}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Location:
                      </span>{" "}
                      {activeItem.location || "Location not added."}
                    </p>
                    <p>
                      <span className="font-semibold text-[#071d35]">
                        Summary:
                      </span>{" "}
                      {activeItem.summary || "No summary added."}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPreviousCard}
                  disabled={activeItems.length <= 1}
                  className="rounded-full border border-[#2d7374]/30 bg-white px-5 py-2 text-sm font-semibold text-[#2d7374] transition hover:bg-[#eef6f6] disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="text-sm font-semibold text-[#31465a]">
                  Card {activeIndex + 1} Of {activeItems.length}
                </span>

                <button
                  type="button"
                  onClick={showNextCard}
                  disabled={activeItems.length <= 1}
                  className="rounded-full border border-[#2d7374]/30 bg-white px-5 py-2 text-sm font-semibold text-[#2d7374] transition hover:bg-[#eef6f6] disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </main>
  );
}