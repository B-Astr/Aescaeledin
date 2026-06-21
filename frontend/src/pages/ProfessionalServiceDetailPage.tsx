// frontend/src/pages/ProfessionalServiceDetailPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./JobDetailPage.css";
import "./HomePage.css";
import { useI18nContext } from "../i18n";
import { usePageMeta } from "../lib/usePageMeta";
import { formatPriceAsInteger } from "../lib/formatPrice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Professional = {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
};

type ProfessionalService = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  price: string | null;
  professional: Professional | null;
};

export default function ProfessionalServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [service, setService] = useState<ProfessionalService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selectMessage, setSelectMessage] = useState("");

  usePageMeta(
    service ? `${service.title} | ASCALEdin` : "Servicio profesional | ASCALEdin",
    service?.description.slice(0, 155) ?? LL.professionalsPage.subtitle()
  );

  useEffect(() => {
    async function loadService() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_URL}/api/public/professionals/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudo cargar el servicio");
        }

        setService(data.service);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [id]);

  async function handleSelectService() {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSelecting(true);
      setSelectMessage("");

      const res = await fetch(`${API_URL}/api/professionals/${id}/select`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo seleccionar el servicio");
      }

      setSelectMessage(LL.serviceDetailPage.serviceSelected());
    } catch (err) {
      setSelectMessage(`Error: ${String(err)}`);
    } finally {
      setSelecting(false);
    }
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
              <div className="job-status-box">{LL.serviceDetailPage.loading()}</div>
            ) : error ? (
              <div className="job-status-box">{error}</div>
            ) : service ? (
              <article className="job-detail-card">
                <Link to="/professionals" className="job-back-link">
                  {LL.serviceDetailPage.backToProfessionals()}
                </Link>

                <h1 className="job-title">{service.title}</h1>

                <div className="job-tags">
                  <span className="job-tag">{service.category}</span>
                  <LocationMapLink
                    location={service.location}
                    latitude={service.latitude}
                    longitude={service.longitude}
                    placeId={service.placeId}
                    fallback={LL.serviceDetailPage.noLocation()}
                    className="job-tag location-map-link"
                  />
                  <span className="job-tag">
                    {formatPriceAsInteger(service.price) ||
                      service.price ||
                      LL.serviceDetailPage.negotiablePrice()}
                  </span>
                </div>

                <p className="job-description">{service.description}</p>

                <div
                  className="job-actions"
                  style={{ marginTop: "20px", flexWrap: "wrap" }}
                >
                  <button
                    onClick={handleSelectService}
                    className="primary-home-button"
                    disabled={selecting}
                  >
                    {selecting ? LL.serviceDetailPage.selecting() : LL.serviceDetailPage.selectService()}
                  </button>
                </div>

                {selectMessage && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "14px 16px",
                      borderRadius: "16px",
                      background: "rgba(15, 23, 42, 0.72)",
                      border: "1px solid rgba(148, 163, 184, 0.12)",
                      color: "#cbd5e1",
                      fontSize: "14px",
                    }}
                  >
                    {selectMessage}
                  </div>
                )}

                {service.professional && (
                  <div style={{ marginTop: "28px" }}>
                    <h2 style={{ color: "#f8fafc", marginBottom: "10px" }}>
                      {LL.serviceDetailPage.professionalTitle()}
                    </h2>

                    <p style={{ color: "#cbd5e1", lineHeight: "1.7" }}>
                      <strong>{service.professional.name || LL.serviceDetailPage.noName()}</strong>
                      {service.professional.headline
                        ? ` · ${service.professional.headline}`
                        : ""}
                    </p>

                    {service.professional.bio && (
                      <p style={{ color: "#94a3b8", lineHeight: "1.7" }}>
                        {service.professional.bio}
                      </p>
                    )}

                    <div
                      className="job-actions"
                      style={{ marginTop: "18px", flexWrap: "wrap" }}
                    >
                      {service.professional.website && (
                        <a
                          href={service.professional.website}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-secondary-button"
                        >
                          {LL.serviceDetailPage.website()}
                        </a>
                      )}

                      {service.professional.linkedinUrl && (
                        <a
                          href={service.professional.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-secondary-button"
                        >
                          LinkedIn
                        </a>
                      )}

                      {service.professional.githubUrl && (
                        <a
                          href={service.professional.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="nav-secondary-button"
                        >
                          GitHub
                        </a>
                      )}

                      <a
                        href={`mailto:${service.professional.email}`}
                        className="primary-home-button"
                      >
                        {LL.serviceDetailPage.contact()}
                      </a>
                    </div>
                  </div>
                )}
              </article>
            ) : (
              <div className="job-status-box">
                {LL.serviceDetailPage.notFound()}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
