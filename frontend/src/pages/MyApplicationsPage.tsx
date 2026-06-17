import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import Navbar from "../components/Navbar";
import { useI18nContext } from "../i18n";
import "./HomePage.css";
import "./MyApplicationsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type MyApplication = {
  id: number;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  job: {
    id: number;
    title: string;
    description: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    placeId: string | null;
    employmentType: string;
    isActive: boolean;
    company: {
      id: number;
      name: string | null;
      picture: string | null;
      headline: string | null;
      location: string | null;
      website: string | null;
    } | null;
  } | null;
};

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/applications/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || LL.myApplicationsPage.loadError());
        }

        setApplications(data.applications ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [LL, navigate]);

  function formatStatus(status: MyApplication["status"]) {
    switch (status) {
      case "ACCEPTED":
        return LL.companyJobApplicationsPage.statusAccepted();
      case "REJECTED":
        return LL.companyJobApplicationsPage.statusRejected();
      case "PENDING":
      default:
        return LL.companyJobApplicationsPage.statusPending();
    }
  }

  function formatDate(value?: string) {
    if (!value) {
      return LL.companyJobApplicationsPage.noDate();
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="my-applications-main">
          <section className="my-applications-header">
            <span>{LL.myApplicationsPage.badge()}</span>
            <h1>{LL.myApplicationsPage.title()}</h1>
            <p>{LL.myApplicationsPage.subtitle()}</p>
          </section>

          {loading ? (
            <div className="my-applications-state">
              {LL.myApplicationsPage.loading()}
            </div>
          ) : error ? (
            <div className="my-applications-state">{error}</div>
          ) : applications.length === 0 ? (
            <div className="my-applications-state">
              <h2>{LL.myApplicationsPage.emptyTitle()}</h2>
              <p>{LL.myApplicationsPage.emptyDesc()}</p>
              <Link to="/jobs" className="primary-home-button">
                {LL.myApplicationsPage.exploreJobs()}
              </Link>
            </div>
          ) : (
            <div className="my-applications-list">
              {applications.map((application) => (
                <article className="my-application-card" key={application.id}>
                  <div className="my-application-top">
                    <div>
                      <span className={`my-application-status ${application.status.toLowerCase()}`}>
                        {formatStatus(application.status)}
                      </span>
                      <h2>
                        {application.job?.title ??
                          LL.myApplicationsPage.unavailableJob()}
                      </h2>
                    </div>

                    {application.job && (
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="nav-secondary-button"
                      >
                        {LL.myApplicationsPage.viewJob()}
                      </Link>
                    )}
                  </div>

                  {application.job?.company && (
                    <p className="my-application-company">
                      <strong>
                        {application.job.company.name ??
                          LL.jobsPage.companyFallback()}
                      </strong>
                      {application.job.company.headline
                        ? ` · ${application.job.company.headline}`
                        : ""}
                    </p>
                  )}

                  {application.job && (
                    <div className="my-application-tags">
                      <LocationMapLink
                        location={application.job.location}
                        latitude={application.job.latitude}
                        longitude={application.job.longitude}
                        placeId={application.job.placeId}
                        fallback={LL.jobsPage.noLocation()}
                        className="my-application-tag location-map-link"
                      />
                    </div>
                  )}

                  <p className="my-application-date">
                    {LL.myApplicationsPage.appliedAt()}{" "}
                    {formatDate(application.createdAt)}
                  </p>

                  {application.message && (
                    <div className="my-application-message">
                      <h3>{LL.myApplicationsPage.coverMessage()}</h3>
                      <p>{application.message}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
