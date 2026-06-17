import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CompanyJobsPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Company = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
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

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();
  const [user, setUser] = useState<MeUser | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingId, setRequestingId] = useState<number | null>(null);
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

        const res = await fetch(`${API_URL}/api/public/companies`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar las empresas");
        }

        setCompanies(data.companies ?? []);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  async function handleRequest(companyId: number) {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRequestingId(companyId);
      setToast(null);

      const res = await fetch(`${API_URL}/api/companies/${companyId}/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || LL.companiesPage.requestError());
      }

      setToast({
        type: "success",
        message: LL.companiesPage.requestSent(),
      });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : LL.companiesPage.requestError(),
      });
    } finally {
      setRequestingId(null);
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
              <span className="company-jobs-badge">{LL.companiesPage.pro()}</span>
              <h1>{LL.companiesPage.regCompanies()}</h1>
              <p>
                {user?.name
                  ? `${LL.companiesPage.explore()}, ${user.name}.`
                  : `${LL.companiesPage.explore()}`}
              </p>
            </div>
          </div>

          {toast && (
            <div className={`page-toast ${toast.type}`} role="status">
              {toast.message}
            </div>
          )}

          {loading ? (
            <div className="company-jobs-empty-card">
              <p>{LL.companiesPage.loading()}</p>
            </div>
          ) : error ? (
            <div className="company-jobs-empty-card">
              <p>{error}</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="company-jobs-empty-card">
              <h2>{LL.companiesPage.noCompanies()}</h2>
              <p>{LL.companiesPage.whenExist()}</p>
            </div>
          ) : (
            <div className="company-jobs-list">
              {companies.map((company) => (
                <article key={company.id} className="company-job-card">
                  <div className="company-job-card-top">
                    <div>
                      <h2>{company.name || LL.companiesPage.noName()}</h2>

                      <div className="company-job-tags">
                        <span>{company.location || LL.companiesPage.noLocation()}</span>
                        <span>{company.email}</span>
                      </div>
                    </div>

                    <div className="company-job-actions">
                      <button
                        onClick={() => handleRequest(company.id)}
                        className="nav-primary-button"
                        disabled={requestingId === company.id}
                      >
                        {requestingId === company.id
                          ? LL.companiesPage.sending()
                          : LL.companiesPage.requestJob()}
                      </button>
                    </div>
                  </div>

                  {company.headline && <p>{company.headline}</p>}
                  {company.bio && <p>{company.bio}</p>}
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
