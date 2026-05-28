// frontend/src/pages/CompanyJobsPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./CompanyJobsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type JobPost = {
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
  updatedAt?: string;
};

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

export default function CompanyJobsPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<MeUser | null>(null);

  useEffect(() => {
    async function loadData() {
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

        const jobsRes = await fetch(`${API_URL}/api/company/jobs/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const jobsData = await jobsRes.json();

        if (!jobsRes.ok) {
          throw new Error(
            jobsData?.error || "No se pudieron cargar tus publicaciones"
          );
        }

        setJobs(jobsData.jobs ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  async function handleDeactivate(jobId: number) {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/api/company/jobs/${jobId}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo desactivar la publicación");
      }

      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, isActive: false } : job
        )
      );
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="company-jobs-main">
          <div className="company-jobs-header">
            <div>
              <span className="company-jobs-badge">{LL.companyJobsPage.badge()}</span>
              <h1>{LL.companyJobsPage.title()}</h1>
              <p>
                {user?.name
                  ? LL.companyJobsPage.manage(user.name)
                  : LL.companyJobsPage.manageDefault()}
              </p>
            </div>

            <Link to="/company/jobs/new" className="primary-home-button">
              {LL.companyJobsPage.createPosting()}
            </Link>
          </div>

          {loading ? (
            <div className="company-jobs-empty-card">
              <p>{LL.companyJobsPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-jobs-empty-card">
              <p>{error}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="company-jobs-empty-card">
              <h2>{LL.companyJobsPage.noPostings()}</h2>
              <p>{LL.companyJobsPage.noPostingsDesc()}</p>
            </div>
          ) : (
            <div className="company-jobs-list">
              {jobs.map((job) => (
                <article key={job.id} className="company-job-card">
                  <div className="company-job-card-top">
                    <div>
                      <h2>{job.title}</h2>
                      <div className="company-job-tags">
                        <span>{job.employmentType}</span>
                        <LocationMapLink
                          location={job.location}
                          latitude={job.latitude}
                          longitude={job.longitude}
                          placeId={job.placeId}
                          fallback={LL.companyJobsPage.noLocation()}
                          className="location-map-link"
                        />
                        <span>{job.isActive ? LL.companyJobsPage.active() : LL.companyJobsPage.deactivated()}</span>
                      </div>
                    </div>

                    <div className="company-job-actions">
                      <Link
                        to={`/company/jobs/${job.id}/applications`}
                        className="nav-secondary-button"
                      >
                        {LL.companyJobsPage.viewApplications()}
                      </Link>

                      <Link
                        to={`/company/jobs/${job.id}/edit`}
                        className="nav-secondary-button"
                      >
                        {LL.companyJobsPage.edit()}
                      </Link>

                      {job.isActive && (
                        <button
                          onClick={() => handleDeactivate(job.id)}
                          className="nav-primary-button"
                        >
                          {LL.companyJobsPage.deactivate()}
                        </button>
                      )}
                    </div>
                  </div>

                  <p>{job.description}</p>
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
