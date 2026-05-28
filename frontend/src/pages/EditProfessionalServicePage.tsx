// frontend/src/pages/EditProfessionalServicePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./CreateJobPage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type MeUser = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
};

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string | null;
  price: string | null;
  isActive: boolean;
};

export default function EditProfessionalServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
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
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudieron cargar tus servicios");
        }

        const currentService = (data.services ?? []).find(
          (service: Service) => String(service.id) === String(id)
        );

        if (!currentService) {
          throw new Error("No se encontró el servicio");
        }

        setTitle(currentService.title);
        setDescription(currentService.description);
        setCategory(currentService.category);
        setLocation(currentService.location || "");
        setPrice(currentService.price || "");
        setIsActive(currentService.isActive);
      } catch (err) {
        setMessage(String(err));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) return;

    if (!title.trim()) {
      setMessage(LL.editServicePage.errorTitle());
      return;
    }

    if (!description.trim()) {
      setMessage(LL.editServicePage.errorDescription());
      return;
    }

    if (!category.trim()) {
      setMessage(LL.editServicePage.errorCategory());
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_URL}/api/pro/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          price,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el servicio");
      }

      navigate("/pro/services");
    } catch (err) {
      setMessage(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="create-job-main">
          <div className="create-job-card">
            <div className="create-job-header">
              <span className="create-job-badge">{LL.editServicePage.badge()}</span>
              <h1>{LL.editServicePage.title()}</h1>
              <p>
                {loading
                  ? LL.editServicePage.loading()
                  : user?.name
                  ? LL.editServicePage.updateAs({ name: user.name })
                  : LL.editServicePage.updateDefault()}
              </p>
            </div>

            {!loading && (
              <form className="create-job-form" onSubmit={handleSubmit}>
                <div className="create-job-field">
                  <label htmlFor="title">{LL.editServicePage.titleLabel()}</label>
                  <input
                    id="title"
                    value={title}
                    readOnly
                    style={{opacity: 0.6, cursor: "not-allowed"}}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="category">{LL.editServicePage.categoryLabel()}</label>
                  <input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="location">{LL.editServicePage.locationLabel()}</label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="price">{LL.editServicePage.priceLabel()}</label>
                  <input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="description">{LL.editServicePage.descriptionLabel()}</label>
                  <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="isActive">{LL.editServicePage.statusLabel()}</label>
                  <select
                    id="isActive"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                  >
                    <option value="true">{LL.editServicePage.active()}</option>
                    <option value="false">{LL.editServicePage.deactivated()}</option>
                  </select>
                </div>

                {message && <div className="create-job-message">{message}</div>}

                <div className="create-job-actions">
                  <button
                    type="submit"
                    className="primary-home-button"
                    disabled={saving}
                  >
                    {saving ? LL.editServicePage.saving() : LL.editServicePage.saveChanges()}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
