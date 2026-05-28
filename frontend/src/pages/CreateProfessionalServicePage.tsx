// frontend/src/pages/CreateProfessionalServicePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JobLocationValidator, {
  type ValidatedJobLocation,
} from "../components/JobLocationValidator";
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

export default function CreateProfessionalServicePage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [locationValidated, setLocationValidated] = useState(false);
  const [price, setPrice] = useState("");

  function handleLocationChange(value: string) {
    setLocation(value);
    setLatitude(null);
    setLongitude(null);
    setPlaceId(null);
    setLocationValidated(false);
  }

  function handleLocationConfirmed(validatedLocation: ValidatedJobLocation) {
    setLocation(validatedLocation.location);
    setLatitude(validatedLocation.latitude);
    setLongitude(validatedLocation.longitude);
    setPlaceId(validatedLocation.placeId);
    setLocationValidated(true);
  }

  useEffect(() => {
    async function checkAccess() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudo validar la sesión");
        }

        setUser(data.user);

        if (data.user.role !== "PRO") {
          navigate("/");
          return;
        }
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) return;

    if (!title.trim()) {
      setMessage(LL.createServicePage.errorTitle());
      return;
    }

    if (!description.trim()) {
      setMessage(LL.createServicePage.errorDescription());
      return;
    }

    if (!category.trim()) {
      setMessage(LL.createServicePage.errorCategory());
      return;
    }

    if (location.trim() && !locationValidated) {
      setMessage(LL.jobLocationValidation.validationRequired());
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_URL}/api/pro/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          latitude,
          longitude,
          placeId,
          price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo crear el servicio");
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
              <span className="create-job-badge">{LL.createServicePage.badge()}</span>
              <h1>{LL.createServicePage.title()}</h1>
              <p>
                {loading
                  ? LL.createServicePage.validating()
                  : user?.name
                  ? LL.createServicePage.publishAs(user.name)
                  : LL.createServicePage.publishDefault()}
              </p>
            </div>

            {!loading && (
              <form className="create-job-form" onSubmit={handleSubmit}>
                <div className="create-job-field">
                  <label htmlFor="title">{LL.createServicePage.titleLabel()}</label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={LL.createServicePage.titlePlaceholder()}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="category">{LL.createServicePage.categoryLabel()}</label>
                  <input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={LL.createServicePage.categoryPlaceholder()}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="location">{LL.createServicePage.locationLabel()}</label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder={LL.createServicePage.locationPlaceholder()}
                  />
                  <JobLocationValidator
                    location={location}
                    isValidated={locationValidated}
                    onConfirm={handleLocationConfirmed}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="price">{LL.createServicePage.priceLabel()}</label>
                  <input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={LL.createServicePage.pricePlaceholder()}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="description">{LL.createServicePage.descriptionLabel()}</label>
                  <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={LL.createServicePage.descriptionPlaceholder()}
                  />
                </div>

                {message && <div className="create-job-message">{message}</div>}

                <div className="create-job-actions">
                  <button
                    type="submit"
                    className="primary-home-button"
                    disabled={saving}
                  >
                    {saving ? LL.createServicePage.saving() : LL.createServicePage.publishService()}
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
