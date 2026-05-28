// frontend/src/pages/JobDetailPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./HomePage.css";
import "./JobDetailPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MAX_MESSAGE = 1000;

type JobDetail = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  employmentType: string;
  isActive: boolean;
  createdAt?: string;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // user context
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // form state
  const [coverMessage, setCoverMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  function formatEmploymentType(value: string) {
    switch (value) {
      case "FULL_TIME": return LL.jobsPage.fullTime();
      case "PART_TIME": return LL.jobsPage.partTime();
      case "CONTRACT": return LL.jobsPage.contract();
      case "INTERNSHIP": return LL.jobsPage.internship();
      default: return value;
    }
  }

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setPageError("");

        const token = sessionStorage.getItem("token");

        const [jobRes, appliedRes, meRes] = await Promise.all([
          fetch(`${API_URL}/api/public/jobs/${id}`),
          token
            ? fetch(`${API_URL}/api/jobs/${id}/applied`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve(null),
          token
            ? fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve(null),
        ]);

        const jobData = await jobRes.json();
        if (!jobRes.ok) {
          throw new Error(jobData?.error || "No se pudo cargar la publicación");
        }
        setJob(jobData.job);

        if (appliedRes?.ok) {
          const appliedData = await appliedRes.json();
          setHasApplied(appliedData.applied);
        }

        if (meRes?.ok) {
          const meData = await meRes.json();
          setIsLoggedIn(true);
          setUserRole(meData.user?.role ?? null);
        } else if (token) {
          // token exists but /me failed — treat as logged out
          setIsLoggedIn(false);
        }
      } catch (err) {
        setPageError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    if (coverMessage.length > MAX_MESSAGE) {
      setFormError(LL.jobDetailPage.errorTooLong());
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setApplying(true);

      const res = await fetch(`${API_URL}/api/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: coverMessage.trim() || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo enviar la postulación");
      }

      setHasApplied(true);
    } catch (err) {
      setFormError(String(err));
    } finally {
      setApplying(false);
    }
  }

  function renderApplySection() {
    // success state
    if (hasApplied) {
      return (
        <div className="apply-section apply-section--success">
          <div className="apply-success-icon">✓</div>
          <h3>{LL.jobDetailPage.successTitle()}</h3>
          <p>{LL.jobDetailPage.successDesc()}</p>
        </div>
      );
    }

    // not logged in
    if (!isLoggedIn) {
      return (
        <div className="apply-section apply-section--notice">
          <h3>{LL.jobDetailPage.loginPromptTitle()}</h3>
          <p>{LL.jobDetailPage.loginPromptDesc()}</p>
          <Link to="/login" className="primary-home-button apply-login-btn">
            {LL.jobDetailPage.loginBtn()}
          </Link>
        </div>
      );
    }

    // wrong role
    if (userRole && userRole !== "CLIENTE") {
      return (
        <div className="apply-section apply-section--notice">
          <p>{LL.jobDetailPage.notClientRole()}</p>
        </div>
      );
    }

    // full form for CLIENTE
    return (
      <div className="apply-section">
        <div className="apply-section-header">
          <h3>{LL.jobDetailPage.applyFormTitle()}</h3>
          <p>{LL.jobDetailPage.applyFormDesc()}</p>
        </div>

        <form className="apply-form" onSubmit={handleSubmit} noValidate>
          <div className="apply-field">
            <label htmlFor="coverMessage">
              {LL.jobDetailPage.coverMessageLabel()}
            </label>
            <textarea
              id="coverMessage"
              rows={5}
              value={coverMessage}
              onChange={(e) => {
                setCoverMessage(e.target.value);
                if (formError) setFormError("");
              }}
              placeholder={LL.jobDetailPage.coverMessagePlaceholder()}
              className={formError ? "apply-textarea--error" : ""}
            />
            <div className="apply-char-row">
              <span
                className={
                  coverMessage.length > MAX_MESSAGE
                    ? "apply-char-count apply-char-count--over"
                    : "apply-char-count"
                }
              >
                {LL.jobDetailPage.charCount(coverMessage.length)}
              </span>
            </div>
          </div>

          {formError && (
            <div className="apply-form-error">{formError}</div>
          )}

          <div className="apply-actions">
            <button
              type="submit"
              className="primary-home-button"
              disabled={applying || coverMessage.length > MAX_MESSAGE}
            >
              {applying
                ? LL.jobDetailPage.sending()
                : LL.jobDetailPage.applyNow()}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
          <div className="job-detail-container">
            {loading ? (
              <div className="job-status-box">{LL.jobDetailPage.loading()}</div>
            ) : pageError ? (
              <div className="job-status-box">{pageError}</div>
            ) : job ? (
              <>
                <article className="job-detail-card">
                  <Link to="/jobs" className="job-back-link">
                    {LL.jobDetailPage.backToJobs()}
                  </Link>

                  <h1 className="job-title">{job.title}</h1>

                  <div className="job-tags">
                    <span className="job-tag">
                      {formatEmploymentType(job.employmentType)}
                    </span>
                    <LocationMapLink
                      location={job.location}
                      latitude={job.latitude}
                      longitude={job.longitude}
                      placeId={job.placeId}
                      fallback={LL.jobDetailPage.noLocation()}
                      className="job-tag location-map-link"
                    />
                  </div>

                  <p className="job-description">{job.description}</p>
                </article>

                {renderApplySection()}
              </>
            ) : null}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
