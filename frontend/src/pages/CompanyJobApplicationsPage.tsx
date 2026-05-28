// frontend/src/pages/CompanyJobApplicationsPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CompanyJobApplicationsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Applicant = {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;

  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  experience: string | null;
  education: string | null;
  skills: string | null;
  resumeUrl: string | null;
};

type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type JobApplication = {
  id: number;
  jobPostId: number;
  applicantUserId: number;
  message: string | null;
  status: ApplicationStatus;
  createdAt?: string;
  applicant: Applicant | null;
};

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

export default function CompanyJobApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function updateStatus(appId: number, status: ApplicationStatus) {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    setUpdatingId(appId);
    try {
      const res = await fetch(
        `${API_URL}/api/company/jobs/${id}/applications/${appId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) return;

      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    async function loadApplications() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meData = await meRes.json();

        if (!meRes.ok) {
          throw new Error(meData?.error || "No se pudo validar la sesión");
        }

        setUser(meData.user);

        if (meData.user.role !== "EMPRESA") {
          navigate("/");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/company/jobs/${id}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "No se pudieron cargar las postulaciones"
          );
        }

        setApplications(data.applications ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [id, navigate]);

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="company-applications-main">
          <div className="company-applications-header">
            <div>
              <span className="company-applications-badge">{LL.companyJobApplicationsPage.badge()}</span>
              <h1>{LL.companyJobApplicationsPage.title()}</h1>
              <p>
                {user?.name
                  ? LL.companyJobApplicationsPage.subtitle({ name: user.name })
                  : LL.companyJobApplicationsPage.subtitleDefault()}
              </p>
            </div>

            <Link to="/company/jobs" className="nav-secondary-button">
              {LL.companyJobApplicationsPage.backToPostings()}
            </Link>
          </div>

          {loading ? (
            <div className="company-applications-empty-card">
              <p>{LL.companyJobApplicationsPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-applications-empty-card">
              <p>{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="company-applications-empty-card">
              <h2>{LL.companyJobApplicationsPage.noApplications()}</h2>
              <p>{LL.companyJobApplicationsPage.noApplicationsDesc()}</p>
            </div>
          ) : (
            <div className="company-applications-list">
              {applications.map((application) => (
                <article
                  key={application.id}
                  className="company-application-card"
                >
                  <div className="company-application-top">
                    <div className="company-applicant-block">
                      {application.applicant?.picture ? (
                        <img
                          src={application.applicant.picture}
                          alt={
                            application.applicant.name ||
                            application.applicant.email
                          }
                          className="company-applicant-avatar"
                        />
                      ) : (
                        <div className="company-applicant-avatar company-applicant-avatar-fallback">
                          {(
                            application.applicant?.name ||
                            application.applicant?.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h2>
                          {application.applicant?.name ||
                            LL.companyJobApplicationsPage.noName()}
                        </h2>
                        <p>{application.applicant?.email || LL.companyJobApplicationsPage.noEmail()}</p>
                        {application.applicant?.headline && (
                          <p className="company-applicant-headline">
                            {application.applicant.headline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="company-application-meta">
                      <span
                        className={`app-status-badge app-status-badge--${application.status.toLowerCase()}`}
                      >
                        {application.status === "ACCEPTED"
                          ? LL.companyJobApplicationsPage.statusAccepted()
                          : application.status === "REJECTED"
                          ? LL.companyJobApplicationsPage.statusRejected()
                          : LL.companyJobApplicationsPage.statusPending()}
                      </span>
                      <span>
                        {LL.companyJobApplicationsPage.appliedAt()}{" "}
                        {application.createdAt
                          ? new Date(application.createdAt).toLocaleString()
                          : LL.companyJobApplicationsPage.noDate()}
                      </span>
                    </div>
                  </div>

                  {application.message && (
                    <div className="company-applicant-details">
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyJobApplicationsPage.coverMessage()}</h4>
                        <p>{application.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="company-applicant-details">
                    {application.applicant?.location && (
                      <div className="company-detail-box">
                        <h4>{LL.companyJobApplicationsPage.locationLabel()}</h4>
                        <p>{application.applicant.location}</p>
                      </div>
                    )}

                    {application.applicant?.phone && (
                      <div className="company-detail-box">
                        <h4>{LL.companyJobApplicationsPage.phoneLabel()}</h4>
                        <p>{application.applicant.phone}</p>
                      </div>
                    )}

                    {application.applicant?.bio && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyJobApplicationsPage.bioLabel()}</h4>
                        <p>{application.applicant.bio}</p>
                      </div>
                    )}

                    {application.applicant?.experience && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyJobApplicationsPage.experienceLabel()}</h4>
                        <p>{application.applicant.experience}</p>
                      </div>
                    )}

                    {application.applicant?.education && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyJobApplicationsPage.educationLabel()}</h4>
                        <p>{application.applicant.education}</p>
                      </div>
                    )}

                    {application.applicant?.skills && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyJobApplicationsPage.skillsLabel()}</h4>
                        <p>{application.applicant.skills}</p>
                      </div>
                    )}
                  </div>

                  <div className="app-status-controls">
                    {(["PENDING", "ACCEPTED", "REJECTED"] as ApplicationStatus[]).map((s) => (
                      <button
                        key={s}
                        disabled={updatingId === application.id}
                        onClick={() => {
                          if (application.status !== s) updateStatus(application.id, s);
                        }}
                        className={`app-status-btn app-status-btn--${s.toLowerCase()}${application.status === s ? " app-status-btn--active" : ""}`}
                      >
                        {updatingId === application.id && application.status !== s
                          ? LL.companyJobApplicationsPage.updatingStatus()
                          : s === "ACCEPTED"
                          ? LL.companyJobApplicationsPage.markAccepted()
                          : s === "REJECTED"
                          ? LL.companyJobApplicationsPage.markRejected()
                          : LL.companyJobApplicationsPage.markPending()}
                      </button>
                    ))}
                  </div>

                  <div className="company-applicant-links">
                    {application.applicant?.website && (
                      <a
                        href={application.applicant.website}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        {LL.companyJobApplicationsPage.websiteBtn()}
                      </a>
                    )}

                    {application.applicant?.linkedinUrl && (
                      <a
                        href={application.applicant.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        LinkedIn
                      </a>
                    )}

                    {application.applicant?.githubUrl && (
                      <a
                        href={application.applicant.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        GitHub
                      </a>
                    )}

                    {application.applicant?.resumeUrl && (
                      <a
                        href={application.applicant.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-primary-button"
                      >
                        {LL.companyJobApplicationsPage.viewCV()}
                      </a>
                    )}
                  </div>
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
