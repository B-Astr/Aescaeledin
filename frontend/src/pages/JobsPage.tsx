// frontend/src/pages/JobsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./HomePage.css";
import { useI18nContext } from "../i18n";
import { usePageMeta } from "../lib/usePageMeta";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type PublicJob = {
  id: number;
  companyUserId: number;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  employmentType: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  company?: {
    id: number;
    name: string | null;
    picture: string | null;
    headline: string | null;
    location: string | null;
    website: string | null;
  } | null;
};

const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

const demoJobs: PublicJob[] = [
  {
    id: 999999,
    companyUserId: 0,
    title: "Frontend Developer",
    description:
      "Buscamos un desarrollador frontend para construir interfaces modernas, responsivas y bien estructuradas con React. Idealmente con conocimientos en TypeScript, consumo de APIs y buenas prácticas de diseño.",
    location: "Remoto / Santiago",
    latitude: null,
    longitude: null,
    placeId: null,
    employmentType: "FULL_TIME",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    company: {
      id: 0,
      name: "Empresa Demo",
      picture: null,
      headline: "Equipo de tecnología",
      location: "Chile",
      website: null,
    },
  },
];

export default function JobsPage() {
  const { LL } = useI18nContext();
  usePageMeta("Empleos | ASCALEdin", LL.jobsPage.subtitle());
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("ALL");

  function formatEmploymentType(value: string) {
    switch (value) {
      case "FULL_TIME": return LL.jobsPage.fullTime();
      case "PART_TIME": return LL.jobsPage.partTime();
      case "CONTRACT": return LL.jobsPage.contract();
      case "INTERNSHIP": return LL.jobsPage.internship();
      default: return value;
    }
  }

  const filteredJobs =
    employmentTypeFilter === "ALL"
      ? jobs
      : jobs.filter((job) => job.employmentType === employmentTypeFilter);

  const hasActiveFilters = employmentTypeFilter !== "ALL";

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");
        setUsingDemoData(false);

        const res = await fetch(`${API_URL}/api/public/jobs`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar los jobs");
        }

        const realJobs = data.jobs ?? [];

        if (realJobs.length === 0) {
          setJobs(demoJobs);
          setUsingDemoData(true);
          return;
        }

        setJobs(realJobs);
      } catch (err) {
        console.error("Error cargando jobs:", err);
        setJobs(demoJobs);
        setUsingDemoData(true);
        setError(
          "No se pudo conectar con el backend. Se está mostrando una publicación de ejemplo."
        );
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main
          className="home-center"
          style={{ justifyContent: "flex-start", paddingTop: "48px" }}
        >
          <div style={{ width: "100%", maxWidth: "1100px" }}>
            <div style={{ textAlign: "left", marginBottom: "28px" }}>
              <h1
                className="home-title"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4.5rem)" }}
              >
                {LL.jobsPage.title()}
              </h1>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "16px",
                  lineHeight: "1.8",
                  maxWidth: "760px",
                  marginTop: "16px",
                }}
              >
                {LL.jobsPage.subtitle()}
              </p>
            </div>

            {loading ? (
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.45)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  borderRadius: "24px",
                  padding: "24px",
                  backdropFilter: "blur(14px)",
                  textAlign: "left",
                  color: "#94a3b8",
                }}
              >
                {LL.jobsPage.loading()}
              </div>
            ) : (
              <>
                {error && (
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.45)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      borderRadius: "24px",
                      padding: "24px",
                      backdropFilter: "blur(14px)",
                      textAlign: "left",
                      color: "#94a3b8",
                      marginBottom: "18px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {usingDemoData && (
                  <div
                    style={{
                      background: "rgba(59, 130, 246, 0.08)",
                      border: "1px solid rgba(96, 165, 250, 0.18)",
                      borderRadius: "18px",
                      padding: "14px 16px",
                      marginBottom: "18px",
                      color: "#bfdbfe",
                      textAlign: "left",
                    }}
                  >
                    {LL.jobsPage.demoNotice()}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      color: "#cbd5e1",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {LL.jobsPage.filterLabel()}
                    <select
                      value={employmentTypeFilter}
                      onChange={(event) =>
                        setEmploymentTypeFilter(event.target.value)
                      }
                      style={{
                        minHeight: "42px",
                        minWidth: "220px",
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        background: "rgba(15, 23, 42, 0.72)",
                        color: "#f8fafc",
                        borderRadius: "14px",
                        padding: "0 12px",
                      }}
                    >
                      <option value="ALL">{LL.jobsPage.allTypes()}</option>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatEmploymentType(type)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="nav-secondary-button"
                      onClick={() => setEmploymentTypeFilter("ALL")}
                    >
                      {LL.jobsPage.clearFilters()}
                    </button>
                  )}
                </div>

                <p
                  style={{
                    color: "#bfdbfe",
                    fontSize: "14px",
                    fontWeight: 700,
                    margin: "0 0 18px",
                    textAlign: "left",
                  }}
                >
                  {LL.jobsPage.resultsCount(filteredJobs.length)}
                </p>

                {filteredJobs.length === 0 ? (
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.45)",
                      border: "1px solid rgba(148, 163, 184, 0.1)",
                      borderRadius: "24px",
                      padding: "24px",
                      backdropFilter: "blur(14px)",
                      textAlign: "left",
                      color: "#94a3b8",
                    }}
                  >
                    {LL.jobsPage.noFilteredResults()}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "18px" }}>
                    {filteredJobs.map((job) => (
                    <article
                      key={job.id}
                      style={{
                        background: "rgba(15, 23, 42, 0.45)",
                        border: "1px solid rgba(148, 163, 184, 0.1)",
                        borderRadius: "24px",
                        padding: "24px",
                        backdropFilter: "blur(14px)",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "20px",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          marginBottom: "14px",
                        }}
                      >
                        <div>
                          <h2 style={{ margin: "0 0 10px", color: "#f8fafc" }}>
                            {job.title}
                          </h2>

                          {job.company && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "12px",
                                color: "#cbd5e1",
                              }}
                            >
                              {job.company.picture ? (
                                <img
                                  src={job.company.picture}
                                  alt={job.company.name ?? LL.jobsPage.companyFallback()}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "999px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "999px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(59, 130, 246, 0.18)",
                                    color: "#bfdbfe",
                                    fontWeight: 800,
                                  }}
                                >
                                  {(job.company.name ?? LL.jobsPage.companyFallback())
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                              <span>
                                <strong>
                                  {job.company.name ?? LL.jobsPage.companyFallback()}
                                </strong>
                                {job.company.headline
                                  ? ` · ${job.company.headline}`
                                  : ""}
                              </span>
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                minHeight: "28px",
                                padding: "0 10px",
                                borderRadius: "999px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(255,255,255,0.05)",
                                color: "#cbd5e1",
                                fontSize: "12px",
                              }}
                            >
                              {formatEmploymentType(job.employmentType)}
                            </span>

                            <LocationMapLink
                              location={job.location}
                              latitude={job.latitude}
                              longitude={job.longitude}
                              placeId={job.placeId}
                              fallback={LL.jobsPage.noLocation()}
                              style={{
                                minHeight: "28px",
                                padding: "0 10px",
                                borderRadius: "999px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(255,255,255,0.05)",
                                color: "#cbd5e1",
                                fontSize: "12px",
                                textDecoration: "none",
                              }}
                            />
                          </div>
                        </div>

                        <Link
                          to={job.id === 999999 ? "/jobs" : `/jobs/${job.id}`}
                          className="primary-home-button"
                        >
                          {LL.jobsPage.applyNow()}
                        </Link>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          lineHeight: "1.7",
                        }}
                      >
                        {job.description}
                      </p>
                    </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
