// frontend/src/pages/ProfessionalsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./HomePage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Professional = {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
  headline: string | null;
  location: string | null;
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
  isActive: boolean;
  professional: Professional | null;
};

const demoServices: ProfessionalService[] = [
  {
    id: 999999,
    title: "Desarrollo web para pymes",
    description:
      "Ofrezco creación de sitios web modernos, responsivos y personalizados para pequeñas empresas, emprendedores y marcas personales. Trabajo con enfoque en diseño limpio, velocidad y experiencia de usuario.",
    category: "Desarrollo Web",
    location: "Remoto / Santiago",
    latitude: null,
    longitude: null,
    placeId: null,
    price: "Desde $150.000",
    isActive: true,
    professional: {
      id: 0,
      name: "Profesional Demo",
      email: "demo@ascaledin.com",
      picture: null,
      headline: "Frontend Developer & Web Designer",
      location: "Chile",
    },
  },
];

export default function ProfessionalsPage() {
  const { LL } = useI18nContext();
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");
        setUsingDemoData(false);

        const res = await fetch(`${API_URL}/api/public/professionals`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error || "No se pudieron cargar los servicios"
          );
        }

        const realServices = data.services ?? [];

        if (realServices.length === 0) {
          setServices(demoServices);
          setUsingDemoData(true);
          return;
        }

        setServices(realServices);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        setServices(demoServices);
        setUsingDemoData(true);
        setError(
          "No se pudo conectar con el backend. Se está mostrando un servicio de ejemplo."
        );
      } finally {
        setLoading(false);
      }
    }

    loadServices();
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
              <div
                style={{
                  display: "inline-flex",
                  minHeight: "32px",
                  padding: "0 14px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(96, 165, 250, 0.22)",
                  color: "#bfdbfe",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "18px",
                }}
              >
                {LL.professionalsPage.badge()}
              </div>

              <h1
                className="home-title"
                style={{ fontSize: "clamp(2.6rem, 5vw, 4.5rem)" }}
              >
                {LL.professionalsPage.title()}
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
                {LL.professionalsPage.subtitle()}
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
                {LL.professionalsPage.loading()}
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
                    {LL.professionalsPage.demoNotice()}
                  </div>
                )}

                <div style={{ display: "grid", gap: "18px" }}>
                  {services.map((service) => (
                    <article
                      key={service.id}
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
                            {service.title}
                          </h2>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              marginBottom: "10px",
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
                              {service.category}
                            </span>

                            <LocationMapLink
                              location={service.location}
                              latitude={service.latitude}
                              longitude={service.longitude}
                              placeId={service.placeId}
                              fallback={LL.professionalsPage.noLocation()}
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
                              {service.price || LL.professionalsPage.negotiablePrice()}
                            </span>
                          </div>

                          {service.professional && (
                            <p
                              style={{
                                margin: 0,
                                color: "#cbd5e1",
                                lineHeight: "1.6",
                              }}
                            >
                              <strong>
                                {service.professional.name ||
                                  LL.professionalsPage.noName()}
                              </strong>
                              {service.professional.headline
                                ? ` · ${service.professional.headline}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <Link
                          to={
                            service.id === 999999
                              ? "/professionals"
                              : `/professionals/${service.id}`
                          }
                          className="primary-home-button"
                        >
                          {LL.professionalsPage.viewService()}
                        </Link>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          lineHeight: "1.7",
                        }}
                      >
                        {service.description}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
