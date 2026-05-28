// frontend/src/pages/ProfessionalServiceSelectionsPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CompanyJobApplicationsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Client = {
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

type ServiceSelection = {
  id: number;
  professionalServiceId: number;
  clientUserId: number;
  createdAt?: string;
  client: Client | null;
};

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

export default function ProfessionalServiceSelectionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [selections, setSelections] = useState<ServiceSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSelections() {
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

        if (meData.user.role !== "PRO") {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_URL}/api/pro/services/${id}/selections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "No se pudieron cargar los interesados"
          );
        }

        setSelections(data.selections ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadSelections();
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
              <span className="company-applications-badge">{LL.serviceSelectionsPage.badge()}</span>
              <h1>{LL.serviceSelectionsPage.title()}</h1>
              <p>
                {user?.name
                  ? LL.serviceSelectionsPage.subtitle({ name: user.name })
                  : LL.serviceSelectionsPage.subtitleDefault()}
              </p>
            </div>

            <Link to="/pro/services" className="nav-secondary-button">
              {LL.serviceSelectionsPage.backToServices()}
            </Link>
          </div>

          {loading ? (
            <div className="company-applications-empty-card">
              <p>{LL.serviceSelectionsPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-applications-empty-card">
              <p>{error}</p>
            </div>
          ) : selections.length === 0 ? (
            <div className="company-applications-empty-card">
              <h2>{LL.serviceSelectionsPage.noSelections()}</h2>
              <p>{LL.serviceSelectionsPage.noSelectionsDesc()}</p>
            </div>
          ) : (
            <div className="company-applications-list">
              {selections.map((selection) => (
                <article
                  key={selection.id}
                  className="company-application-card"
                >
                  <div className="company-application-top">
                    <div className="company-applicant-block">
                      {selection.client?.picture ? (
                        <img
                          src={selection.client.picture}
                          alt={
                            selection.client.name || selection.client.email
                          }
                          className="company-applicant-avatar"
                        />
                      ) : (
                        <div className="company-applicant-avatar company-applicant-avatar-fallback">
                          {(
                            selection.client?.name ||
                            selection.client?.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h2>{selection.client?.name || LL.serviceSelectionsPage.noName()}</h2>
                        <p>{selection.client?.email || LL.serviceSelectionsPage.noEmail()}</p>
                        {selection.client?.headline && (
                          <p className="company-applicant-headline">
                            {selection.client.headline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="company-application-meta">
                      <span>
                        {LL.serviceSelectionsPage.selectedAt()}{" "}
                        {selection.createdAt
                          ? new Date(selection.createdAt).toLocaleString()
                          : LL.serviceSelectionsPage.noDate()}
                      </span>
                    </div>
                  </div>

                  <div className="company-applicant-details">
                    {selection.client?.location && (
                      <div className="company-detail-box">
                        <h4>{LL.serviceSelectionsPage.locationLabel()}</h4>
                        <p>{selection.client.location}</p>
                      </div>
                    )}

                    {selection.client?.phone && (
                      <div className="company-detail-box">
                        <h4>{LL.serviceSelectionsPage.phoneLabel()}</h4>
                        <p>{selection.client.phone}</p>
                      </div>
                    )}

                    {selection.client?.bio && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.serviceSelectionsPage.bioLabel()}</h4>
                        <p>{selection.client.bio}</p>
                      </div>
                    )}

                    {selection.client?.experience && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.serviceSelectionsPage.experienceLabel()}</h4>
                        <p>{selection.client.experience}</p>
                      </div>
                    )}

                    {selection.client?.education && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.serviceSelectionsPage.educationLabel()}</h4>
                        <p>{selection.client.education}</p>
                      </div>
                    )}

                    {selection.client?.skills && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.serviceSelectionsPage.skillsLabel()}</h4>
                        <p>{selection.client.skills}</p>
                      </div>
                    )}
                  </div>

                  <div className="company-applicant-links">
                    {selection.client?.website && (
                      <a
                        href={selection.client.website}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        {LL.serviceSelectionsPage.website()}
                      </a>
                    )}

                    {selection.client?.linkedinUrl && (
                      <a
                        href={selection.client.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        LinkedIn
                      </a>
                    )}

                    {selection.client?.githubUrl && (
                      <a
                        href={selection.client.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-secondary-button"
                      >
                        GitHub
                      </a>
                    )}

                    <a
                      href={`mailto:${selection.client?.email}`}
                      className="nav-primary-button"
                    >
                      {LL.serviceSelectionsPage.contact()}
                    </a>
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
