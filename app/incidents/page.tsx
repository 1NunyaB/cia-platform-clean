"use client";

import { useEffect, useMemo, useState } from "react";

type CaseItem = {
  id: string;
  caseCode: string;
  title: string;
  description?: string;
  status?: string;
  createdAt: string;
};

type IncidentStatus =
  | "needs_evidence"
  | "has_evidence"
  | "needs_review"
  | "timeline_ready"
  | "closed";

type TimelineTrack = "not_ready" | "timeline_1" | "timeline_2" | "timeline_3";

type IncidentPerson = {
  id: string;
  name: string;
  role: string;
};

type SavedPerson = {
  id: string;
  name: string;
};

type SavedLocationOptions = {
  cities: string[];
  states: string[];
  postalCodes: string[];
};

type IncidentItem = {
  id: string;
  incidentCode: string;
  title: string;
  incidentDate: string;

  placeName: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  mapLocation: string;

  linkedCaseId: string;
  linkedCaseCode: string;
  linkedCaseTitle: string;
  status: IncidentStatus;
  timelineTrack: TimelineTrack;
  peopleInvolved: IncidentPerson[];
  sourceReference: string;
  dojReference: string;
  pageNumber: string;
  summary: string;
  notes: string;
  createdAt: string;
};

const CASES_STORAGE_KEY = "casefile_commons_cases";
const INCIDENTS_STORAGE_KEY = "casefile_commons_incidents";
const PEOPLE_STORAGE_KEY = "casefile_commons_people";
const LOCATION_OPTIONS_STORAGE_KEY = "casefile_commons_location_options";

const roleOptions = [
  "Unknown",
  "Accuser",
  "Victim",
  "Witness",
  "Subject",
  "Associate",
  "Attorney",
  "Judge",
  "Law Enforcement",
  "Journalist / Commentator",
  "Investigator",
  "Organization",
  "Other",
];

const statusOptions: {
  value: IncidentStatus;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    value: "needs_evidence",
    label: "Needs Evidence",
    description:
      "Incident is logged, but supporting evidence still needs to be attached.",
    className: "border-[#2d7374]/40 bg-[#e8f4f4] text-[#1f5b5c]",
  },
  {
    value: "has_evidence",
    label: "Has Evidence",
    description: "Incident has evidence connected and can be reviewed.",
    className: "border-blue-300 bg-blue-50 text-blue-800",
  },
  {
    value: "needs_review",
    label: "Needs Review",
    description: "Incident needs closer review before timeline use.",
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "timeline_ready",
    label: "Timeline Ready",
    description: "Incident is ready to be added to a timeline.",
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Incident is closed for now.",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
];

const timelineOptions: {
  value: TimelineTrack;
  label: string;
  description: string;
  className: string;
}[] = [
  {
    value: "not_ready",
    label: "Not Timeline Ready",
    description: "Do not send this incident to a timeline yet.",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
  {
    value: "timeline_1",
    label: "Timeline 1 — Confirmed / Core",
    description: "Use for stronger, central, or confirmed timeline items.",
    className: "border-[#2d7374]/40 bg-[#e8f4f4] text-[#1f5b5c]",
  },
  {
    value: "timeline_2",
    label: "Timeline 2 — Working / User Review",
    description: "Use for items that need review, comparison, or follow-up.",
    className: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: "timeline_3",
    label: "Timeline 3 — Pattern / Context",
    description: "Use for pattern-building, context, or supporting items.",
    className: "border-indigo-300 bg-indigo-50 text-indigo-800",
  },
];

function getStatusOption(status: IncidentStatus) {
  return (
    statusOptions.find((option) => option.value === status) || statusOptions[0]
  );
}

function getTimelineOption(track: TimelineTrack) {
  return (
    timelineOptions.find((option) => option.value === track) ||
    timelineOptions[0]
  );
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createIncidentCode(existingIncidents: IncidentItem[]) {
  const nextNumber = existingIncidents.length + 1;
  return `INC-${String(nextNumber).padStart(4, "0")}`;
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

function loadLocationOptions(): SavedLocationOptions {
  if (typeof window === "undefined") {
    return { cities: [], states: [], postalCodes: [] };
  }

  const saved = window.localStorage.getItem(LOCATION_OPTIONS_STORAGE_KEY);

  if (!saved) {
    return { cities: [], states: [], postalCodes: [] };
  }

  try {
    const parsed = JSON.parse(saved) as Partial<SavedLocationOptions>;

    return {
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      states: Array.isArray(parsed.states) ? parsed.states : [],
      postalCodes: Array.isArray(parsed.postalCodes)
        ? parsed.postalCodes
        : [],
    };
  } catch {
    return { cities: [], states: [], postalCodes: [] };
  }
}

function buildLocationDisplay(item: IncidentItem) {
  return (
    [
      item.placeName,
      item.city,
      item.stateRegion,
      item.postalCode,
      item.country,
    ]
      .filter(Boolean)
      .join(", ") || "Not Added"
  );
}

function buildMapDisplay(item: IncidentItem) {
  return (
    item.mapLocation ||
    [item.city, item.stateRegion, item.postalCode, item.country]
      .filter(Boolean)
      .join(", ") ||
    "No Map Location"
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export default function IncidentsPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [savedPeople, setSavedPeople] = useState<SavedPerson[]>([]);
  const [locationOptions, setLocationOptions] =
    useState<SavedLocationOptions>({
      cities: [],
      states: [],
      postalCodes: [],
    });

  const [linkedCaseId, setLinkedCaseId] = useState("");
  const [title, setTitle] = useState("");
  const [incidentDate, setIncidentDate] = useState("");

  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [mapLocation, setMapLocation] = useState("");

  const [status, setStatus] = useState<IncidentStatus>("needs_evidence");
  const [timelineTrack, setTimelineTrack] =
    useState<TimelineTrack>("not_ready");

  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("Unknown");
  const [selectedPeople, setSelectedPeople] = useState<IncidentPerson[]>([]);

  const [sourceReference, setSourceReference] = useState("");
  const [dojReference, setDojReference] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCases = loadArrayFromStorage<CaseItem>(CASES_STORAGE_KEY);
    const savedIncidents =
      loadArrayFromStorage<IncidentItem>(INCIDENTS_STORAGE_KEY);
    const savedNames = loadArrayFromStorage<SavedPerson>(PEOPLE_STORAGE_KEY);

    setCases(savedCases);
    setSavedPeople(savedNames);
    setLocationOptions(loadLocationOptions());

    const normalizedIncidents = savedIncidents.map((item, index) => {
      const oldItem = item as IncidentItem & {
        location?: string;
        cityState?: string;
        peopleInvolved?: IncidentPerson[] | string;
      };

      const normalizedPeople = Array.isArray(oldItem.peopleInvolved)
        ? oldItem.peopleInvolved
        : oldItem.peopleInvolved
          ? String(oldItem.peopleInvolved)
              .split(",")
              .map((name) => ({
                id: createId("person"),
                name: name.trim(),
                role: "Unknown",
              }))
              .filter((person) => person.name)
          : [];

      return {
        ...oldItem,
        incidentCode:
          oldItem.incidentCode || `INC-${String(index + 1).padStart(4, "0")}`,
        timelineTrack: oldItem.timelineTrack || "not_ready",
        placeName: oldItem.placeName || oldItem.location || "",
        city: oldItem.city || "",
        stateRegion: oldItem.stateRegion || oldItem.cityState || "",
        postalCode: oldItem.postalCode || "",
        country: oldItem.country || "",
        mapLocation: oldItem.mapLocation || "",
        peopleInvolved: normalizedPeople,
      };
    });

    setIncidents(normalizedIncidents);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      INCIDENTS_STORAGE_KEY,
      JSON.stringify(incidents)
    );
  }, [incidents]);

  useEffect(() => {
    window.localStorage.setItem(
      PEOPLE_STORAGE_KEY,
      JSON.stringify(savedPeople)
    );
  }, [savedPeople]);

  useEffect(() => {
    window.localStorage.setItem(
      LOCATION_OPTIONS_STORAGE_KEY,
      JSON.stringify(locationOptions)
    );
  }, [locationOptions]);

  const sortedIncidents = useMemo(() => {
    return [...incidents].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [incidents]);

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === linkedCaseId) || null;
  }, [cases, linkedCaseId]);

  function addPersonToIncident() {
    setMessage("");

    const cleanName = personName.trim();
    const cleanRole = personRole.trim() || "Unknown";

    if (!cleanName) {
      setMessage("Person Name Is Required Before Adding A Person.");
      return;
    }

    const newPerson: IncidentPerson = {
      id: createId("incident_person"),
      name: cleanName,
      role: cleanRole,
    };

    setSelectedPeople((current) => [...current, newPerson]);

    setSavedPeople((current) => {
      const alreadySaved = current.some(
        (person) => person.name.toLowerCase() === cleanName.toLowerCase()
      );

      if (alreadySaved) return current;

      return [...current, { id: createId("saved_person"), name: cleanName }];
    });

    setPersonName("");
    setPersonRole("Unknown");
  }

  function removePersonFromIncident(personId: string) {
    setSelectedPeople((current) =>
      current.filter((person) => person.id !== personId)
    );
  }

  function saveLocationOptionUpdates(newIncident: IncidentItem) {
    setLocationOptions((current) => ({
      cities: uniqueSorted([...current.cities, newIncident.city]),
      states: uniqueSorted([...current.states, newIncident.stateRegion]),
      postalCodes: uniqueSorted([
        ...current.postalCodes,
        newIncident.postalCode,
      ]),
    }));
  }

  function addIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanTitle = title.trim();

    if (!linkedCaseId || !selectedCase) {
      setMessage("Select A Linked Case Before Saving.");
      return;
    }

    if (!cleanTitle) {
      setMessage("Incident Title Is Required.");
      return;
    }

    const newIncident: IncidentItem = {
      id: createId("incident"),
      incidentCode: createIncidentCode(incidents),
      title: cleanTitle,
      incidentDate: incidentDate.trim(),

      placeName: placeName.trim(),
      city: city.trim(),
      stateRegion: stateRegion.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      mapLocation: mapLocation.trim(),

      linkedCaseId: selectedCase.id,
      linkedCaseCode: selectedCase.caseCode,
      linkedCaseTitle: selectedCase.title,
      status,
      timelineTrack,
      peopleInvolved: selectedPeople,
      sourceReference: sourceReference.trim(),
      dojReference: dojReference.trim() ? `EFTA${dojReference.trim()}` : "",
      pageNumber: pageNumber.trim(),
      summary: summary.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setIncidents((current) => [newIncident, ...current]);
    saveLocationOptionUpdates(newIncident);

    setLinkedCaseId("");
    setTitle("");
    setIncidentDate("");

    setPlaceName("");
    setCity("");
    setStateRegion("");
    setPostalCode("");
    setCountry("");
    setMapLocation("");

    setStatus("needs_evidence");
    setTimelineTrack("not_ready");
    setSelectedPeople([]);
    setPersonName("");
    setPersonRole("Unknown");
    setSourceReference("");
    setDojReference("");
    setPageNumber("");
    setSummary("");
    setNotes("");
    setMessage(`${newIncident.incidentCode} Added To Current Incident List.`);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#071d35]">
      <div className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d7e2e5] pb-6">
          <a href="/dashboard" className="text-sm font-semibold text-[#2d7374]">
            ← Back To Dashboard
          </a>

          <a href="/cases" className="text-sm font-semibold text-[#2d7374]">
            Back To Master Case List →
          </a>
        </header>

        <section className="py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2d7374]">
            Incidents
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#071d35] sm:text-5xl">
            Incident List
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#31465a] sm:text-lg">
            Add incidents, connect them to saved cases, and prepare them for
            linked evidence, card stacks, timelines, and the world map.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-[#d7e2e5] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#071d35]">
              Add Incident
            </h2>

            <form onSubmit={addIncident} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Linked Case
                </label>
                <select
                  value={linkedCaseId}
                  onChange={(event) => setLinkedCaseId(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                >
                  <option value="">Select A Case</option>
                  {cases.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.caseCode} — {item.title}
                    </option>
                  ))}
                </select>

                {cases.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-700">
                    No cases found yet. Add a case before saving incidents.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Incident Title / Name
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Meeting, transaction, filing, statement, or event"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Incident Date
                </label>
                <input
                  value={incidentDate}
                  onChange={(event) => setIncidentDate(event.target.value)}
                  placeholder="Exact or approximate date"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Street / Place Name
                  </label>
                  <input
                    value={placeName}
                    onChange={(event) => setPlaceName(event.target.value)}
                    placeholder="Example: courthouse, residence, airport, office"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Map Location Label
                  </label>
                  <input
                    value={mapLocation}
                    onChange={(event) => setMapLocation(event.target.value)}
                    placeholder="Example: Palm Beach, Florida"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    City
                  </label>
                  <input
                    list="saved-cities"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Example: Palm Beach"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                  <datalist id="saved-cities">
                    {locationOptions.cities.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    State / Region
                  </label>
                  <input
                    list="saved-states"
                    value={stateRegion}
                    onChange={(event) => setStateRegion(event.target.value)}
                    placeholder="Example: Florida"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                  <datalist id="saved-states">
                    {locationOptions.states.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Zip / Postal Code
                  </label>
                  <input
                    list="saved-postal-codes"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="Example: 33480"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                  <datalist id="saved-postal-codes">
                    {locationOptions.postalCodes.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Country
                  </label>
                  <input
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="Example: United States"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#071d35]">
                  Timeline Track
                </div>
                <p className="mt-1 text-sm text-[#31465a]">
                  Choose whether this incident is ready for one of the three
                  timelines.
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {timelineOptions.map((option) => {
                    const selected = timelineTrack === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTimelineTrack(option.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? `${option.className} ring-4 ring-[#2d7374]/10`
                            : "border-[#d7e2e5] bg-[#f7f9fa] text-[#31465a] hover:border-[#2d7374]/40"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 opacity-80">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#071d35]">
                  Incident Status
                </div>

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

              <div className="rounded-3xl border border-[#d7e2e5] bg-[#f7f9fa] p-4">
                <h3 className="text-sm font-semibold text-[#071d35]">
                  People Involved
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#31465a]">
                  Add one or more people. Role can stay Unknown if the role is
                  unclear.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
                  <div>
                    <label className="text-xs font-semibold text-[#071d35]">
                      Saved Name Or New Name
                    </label>
                    <input
                      list="saved-people"
                      value={personName}
                      onChange={(event) => setPersonName(event.target.value)}
                      placeholder="Type or choose a saved name"
                      className="mt-2 min-h-11 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                    />
                    <datalist id="saved-people">
                      {savedPeople.map((person) => (
                        <option key={person.id} value={person.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#071d35]">
                      Role
                    </label>
                    <select
                      value={personRole}
                      onChange={(event) => setPersonRole(event.target.value)}
                      className="mt-2 min-h-11 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addPersonToIncident}
                    className="self-end rounded-full bg-[#071d35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
                  >
                    Add Person
                  </button>
                </div>

                {selectedPeople.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedPeople.map((person) => (
                      <span
                        key={person.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[#2d7374]/30 bg-white px-3 py-1 text-xs font-semibold text-[#31465a]"
                      >
                        {person.name} — {person.role}
                        <button
                          type="button"
                          onClick={() => removePersonFromIncident(person.id)}
                          className="text-[#2d7374] hover:text-[#071d35]"
                          aria-label={`Remove ${person.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#31465a]">
                    No people added to this incident yet.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Source / Reference
                  </label>
                  <input
                    value={sourceReference}
                    onChange={(event) => setSourceReference(event.target.value)}
                    placeholder="URL, transcript, filing, etc."
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    DOJ / EFTA Reference
                  </label>

                  <div className="mt-2 flex min-h-12 overflow-hidden rounded-2xl border border-[#cfdadd] bg-white focus-within:border-[#2d7374] focus-within:ring-4 focus-within:ring-[#2d7374]/10">
                    <span className="flex items-center border-r border-[#cfdadd] bg-[#f7f9fa] px-4 text-sm font-semibold text-[#2d7374]">
                      EFTA
                    </span>

                    <input
                      value={dojReference}
                      onChange={(event) => {
                        const cleaned = event.target.value
                          .replace(/^EFTA[-\s]*/i, "")
                          .replace(/[^\d]/g, "");

                        setDojReference(cleaned);
                      }}
                      placeholder="01334003"
                      className="min-h-12 flex-1 bg-white px-4 text-sm text-[#071d35] outline-none placeholder:text-[#7d8c98]"
                    />
                  </div>

                  <p className="mt-1 text-xs text-[#31465a]">
                    Saved as EFTA{dojReference || "#######"}.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#071d35]">
                    Page Number
                  </label>
                  <input
                    value={pageNumber}
                    onChange={(event) => setPageNumber(event.target.value)}
                    placeholder="Page, Bates, or range"
                    className="mt-2 min-h-12 w-full rounded-2xl border border-[#cfdadd] bg-white px-4 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Short Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="What happened?"
                  className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#cfdadd] bg-white px-4 py-3 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#071d35]">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Extra context, uncertainty, or follow-up questions."
                  className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-[#cfdadd] bg-white px-4 py-3 text-sm text-[#071d35] outline-none transition placeholder:text-[#7d8c98] focus:border-[#2d7374] focus:ring-4 focus:ring-[#2d7374]/10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="min-h-12 rounded-full bg-[#071d35] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b2a4a]"
                >
                  Save Incident
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
                  Current Incident List
                </h2>
                <p className="mt-1 text-sm text-[#31465a]">
                  Incident Title, Incident ID, Linked Case, Timeline, Map
                  Location, and Status are shown together.
                </p>
              </div>

              <span className="rounded-full border border-[#d7e2e5] bg-[#f7f9fa] px-4 py-2 text-sm font-semibold text-[#31465a]">
                Total Incidents: {incidents.length}
              </span>
            </div>

            {sortedIncidents.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-[#cfdadd] bg-[#f7f9fa] p-8 text-center text-sm text-[#31465a]">
                No Incidents Added Yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {sortedIncidents.map((item) => {
                  const statusOption = getStatusOption(item.status);
                  const timelineOption = getTimelineOption(item.timelineTrack);

                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#d7e2e5] bg-[#f7f9fa] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="block truncate text-base font-semibold text-[#071d35]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2d7374]">
                            Incident ID: {item.incidentCode}
                          </p>

                          <a
                            href={`/cases/${item.linkedCaseId}`}
                            className="mt-1 block text-xs font-semibold text-[#2d7374] hover:underline"
                          >
                            Linked Case: {item.linkedCaseCode} —{" "}
                            {item.linkedCaseTitle}
                          </a>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusOption.className}`}
                        >
                          {statusOption.label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${timelineOption.className}`}
                        >
                          {timelineOption.label}
                        </span>

                        <span className="rounded-full border border-[#d7e2e5] bg-white px-3 py-1 text-xs font-semibold text-[#31465a]">
                          Map: {buildMapDisplay(item)}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs font-semibold text-[#31465a] sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#d7e2e5] bg-white p-3">
                          Date: {item.incidentDate || "Not Added"}
                        </div>

                        <div className="rounded-2xl border border-[#d7e2e5] bg-white p-3">
                          Location: {buildLocationDisplay(item)}
                        </div>
                      </div>

                      {item.peopleInvolved.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.peopleInvolved.map((person) => (
                            <span
                              key={person.id}
                              className="rounded-full border border-[#d7e2e5] bg-white px-3 py-1 text-xs font-semibold text-[#31465a]"
                            >
                              {person.name} — {person.role}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {item.summary ? (
                        <p className="mt-3 text-sm leading-6 text-[#31465a]">
                          {item.summary}
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