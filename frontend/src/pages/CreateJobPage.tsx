// frontend/src/pages/CreateJobPage.tsx
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

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [locationValidated, setLocationValidated] = useState(false);
  const [employmentType, setEmploymentType] = useState("FULL_TIME");

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudo validar la sesión");
        }

        setUser(data.user);

        if (data.user.role !== "EMPRESA") {
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
      setMessage(LL.createJobPage.errorTitle());
      return;
    }

    if (!description.trim()) {
      setMessage(LL.createJobPage.errorDescription());
      return;
    }

    if (location.trim() && !locationValidated) {
      setMessage(LL.jobLocationValidation.validationRequired());
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_URL}/api/company/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          latitude,
          longitude,
          placeId,
          employmentType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo crear la publicación");
      }

      navigate("/company/jobs");
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
              <span className="create-job-badge">{LL.createJobPage.badge()}</span>
              <h1>{LL.createJobPage.title()}</h1>
              <p>
                {loading
                  ? LL.createJobPage.validating()
                  : user?.name
                  ? LL.createJobPage.publishAs(user.name)
                  : LL.createJobPage.publishDefault()}
              </p>
            </div>

            {!loading && (
              <form className="create-job-form" onSubmit={handleSubmit}>
                <div className="create-job-field">
                  <label htmlFor="title">{LL.createJobPage.titleLabel()}</label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={LL.createJobPage.titlePlaceholder()}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="location">{LL.createJobPage.locationLabel()}</label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder={LL.createJobPage.locationPlaceholder()}
                  />
                  <JobLocationValidator
                    location={location}
                    isValidated={locationValidated}
                    onConfirm={handleLocationConfirmed}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="employmentType">{LL.createJobPage.employmentTypeLabel()}</label>
                  <select
                    id="employmentType"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                  >
                    <option value="FULL_TIME">{LL.jobsPage.fullTime()}</option>
                    <option value="PART_TIME">{LL.jobsPage.partTime()}</option>
                    <option value="CONTRACT">{LL.jobsPage.contract()}</option>
                    <option value="INTERNSHIP">{LL.jobsPage.internship()}</option>
                  </select>
                </div>

                <div className="create-job-field">
                  <label htmlFor="description">{LL.createJobPage.descriptionLabel()}</label>
                  <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={LL.createJobPage.descriptionPlaceholder()}
                  />
                </div>

                {message && <div className="create-job-message">{message}</div>}

                <div className="create-job-actions">
                  <button
                    type="submit"
                    className="primary-home-button"
                    disabled={saving}
                  >
                    {saving ? LL.createJobPage.saving() : LL.createJobPage.publish()}
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
