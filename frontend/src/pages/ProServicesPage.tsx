// frontend/src/pages/ProServicesPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationMapLink from "../components/LocationMapLink";
import "./CompanyJobsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Service = {
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
};

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

type ToastState = {
  type: "success" | "error";
  message: string;
};

export default function ProServicesPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<MeUser | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

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

        if (meData.user.role !== "PRO") {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_URL}/api/pro/services/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar tus servicios");
        }

        setServices(data.services ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  async function handleDeactivate(serviceId: number) {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      setToast(null);

      const res = await fetch(
        `${API_URL}/api/pro/services/${serviceId}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || LL.proServicesPage.deactivateError());
      }

      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? { ...service, isActive: false } : service
        )
      );

      setToast({
        type: "success",
        message: LL.proServicesPage.serviceDeactivated(),
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : LL.proServicesPage.deactivateError(),
      });
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
              <span className="company-jobs-badge">{LL.proServicesPage.badge()}</span>
              <h1>{LL.proServicesPage.title()}</h1>
              <p>
                {user?.name
                  ? LL.proServicesPage.manage(user.name)
                  : LL.proServicesPage.manageDefault()}
              </p>
            </div>

            <Link to="/pro/services/new" className="primary-home-button">
              {LL.proServicesPage.createService()}
            </Link>
          </div>

          {toast && (
            <div className={`page-toast ${toast.type}`} role="status">
              {toast.message}
            </div>
          )}

          {loading ? (
            <div className="company-jobs-empty-card">
              <p>{LL.proServicesPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-jobs-empty-card">
              <p>{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="company-jobs-empty-card">
              <h2>{LL.proServicesPage.noServices()}</h2>
              <p>{LL.proServicesPage.noServicesDesc()}</p>
            </div>
          ) : (
            <div className="company-jobs-list">
              {services.map((service) => (
                <article key={service.id} className="company-job-card">
                  <div className="company-job-card-top">
                    <div>
                      <h2>{service.title}</h2>

                      <div className="company-job-tags">
                        <span>{service.category}</span>
                        <LocationMapLink
                          location={service.location}
                          latitude={service.latitude}
                          longitude={service.longitude}
                          placeId={service.placeId}
                          fallback={LL.proServicesPage.noLocation()}
                          className="location-map-link"
                        />
                        <span>{service.price || LL.proServicesPage.negotiablePrice()}</span>
                        <span>
                          {service.isActive ? LL.proServicesPage.active() : LL.proServicesPage.deactivated()}
                        </span>
                      </div>
                    </div>

                    <div className="company-job-actions">
                      <Link
                        to={`/pro/services/${service.id}/selections`}
                        className="nav-secondary-button"
                      >
                        {LL.proServicesPage.viewInterested()}
                      </Link>

                      <Link
                        to={`/pro/services/${service.id}/edit`}
                        className="nav-secondary-button"
                      >
                        {LL.proServicesPage.edit()}
                      </Link>

                      {service.isActive && (
                        <button
                          onClick={() => handleDeactivate(service.id)}
                          className="nav-primary-button"
                        >
                          {LL.proServicesPage.deactivate()}
                        </button>
                      )}
                    </div>
                  </div>

                  <p>{service.description}</p>
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
