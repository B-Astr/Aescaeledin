import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CompanyJobApplicationsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Professional = {
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

type CompanyRequest = {
  id: number;
  companyUserId: number;
  professionalUserId: number;
  createdAt?: string;
  professional: Professional | null;
};

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

export default function CompanyRequestsPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
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

        const res = await fetch(`${API_URL}/api/company/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar las solicitudes");
        }

        setRequests(data.requests ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, [navigate]);

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="company-applications-main">
          <div className="company-applications-header">
            <div>
              <span className="company-applications-badge">{LL.companyRequestsPage.badge()}</span>
              <h1>{LL.companyRequestsPage.title()}</h1>
              <p>
                {user?.name
                  ? LL.companyRequestsPage.subtitle({ name: user.name })
                  : LL.companyRequestsPage.subtitleDefault()}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="company-applications-empty-card">
              <p>{LL.companyRequestsPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-applications-empty-card">
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="company-applications-empty-card">
              <h2>{LL.companyRequestsPage.noRequests()}</h2>
              <p>{LL.companyRequestsPage.noRequestsDesc()}</p>
            </div>
          ) : (
            <div className="company-applications-list">
              {requests.map((request) => (
                <article key={request.id} className="company-application-card">
                  <div className="company-application-top">
                    <div className="company-applicant-block">
                      {request.professional?.picture ? (
                        <img
                          src={request.professional.picture}
                          alt={
                            request.professional.name ||
                            request.professional.email
                          }
                          className="company-applicant-avatar"
                        />
                      ) : (
                        <div className="company-applicant-avatar company-applicant-avatar-fallback">
                          {(
                            request.professional?.name ||
                            request.professional?.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h2>
                          {request.professional?.name || LL.companyRequestsPage.noName()}
                        </h2>
                        <p>{request.professional?.email || LL.companyRequestsPage.noEmail()}</p>
                        {request.professional?.headline && (
                          <p className="company-applicant-headline">
                            {request.professional.headline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="company-application-meta">
                      <span>
                        {LL.companyRequestsPage.requestedAt()}{" "}
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : LL.companyRequestsPage.noDate()}
                      </span>
                    </div>
                  </div>

                  <div className="company-applicant-details">
                    {request.professional?.location && (
                      <div className="company-detail-box">
                        <h4>{LL.companyRequestsPage.locationLabel()}</h4>
                        <p>{request.professional.location}</p>
                      </div>
                    )}

                    {request.professional?.phone && (
                      <div className="company-detail-box">
                        <h4>{LL.companyRequestsPage.phoneLabel()}</h4>
                        <p>{request.professional.phone}</p>
                      </div>
                    )}

                    {request.professional?.bio && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyRequestsPage.bioLabel()}</h4>
                        <p>{request.professional.bio}</p>
                      </div>
                    )}

                    {request.professional?.experience && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyRequestsPage.experienceLabel()}</h4>
                        <p>{request.professional.experience}</p>
                      </div>
                    )}

                    {request.professional?.education && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyRequestsPage.educationLabel()}</h4>
                        <p>{request.professional.education}</p>
                      </div>
                    )}

                    {request.professional?.skills && (
                      <div className="company-detail-box company-detail-box-full">
                        <h4>{LL.companyRequestsPage.skillsLabel()}</h4>
                        <p>{request.professional.skills}</p>
                      </div>
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
