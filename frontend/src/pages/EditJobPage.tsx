// frontend/src/pages/EditJobPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

type CompanyJob = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  employmentType: string;
  isActive: boolean;
};

export default function EditJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [isActive, setIsActive] = useState(true);

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

        const currentJob = (jobsData.jobs ?? []).find(
          (job: CompanyJob) => String(job.id) === String(id)
        );

        if (!currentJob) {
          throw new Error("No se encontró la publicación");
        }

        setTitle(currentJob.title);
        setDescription(currentJob.description);
        setLocation(currentJob.location || "");
        setLatitude(currentJob.latitude ?? null);
        setLongitude(currentJob.longitude ?? null);
        setPlaceId(currentJob.placeId ?? null);
        setLocationValidated(
          currentJob.latitude != null && currentJob.longitude != null
        );
        setEmploymentType(currentJob.employmentType);
        setIsActive(currentJob.isActive);
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
      setMessage(LL.editJobPage.errorTitle());
      return;
    }

    if (!description.trim()) {
      setMessage(LL.editJobPage.errorDescription());
      return;
    }

    if (location.trim() && !locationValidated) {
      setMessage(LL.jobLocationValidation.validationRequired());
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_URL}/api/company/jobs/${id}`, {
        method: "PUT",
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
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar la publicación");
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
              <span className="create-job-badge">{LL.editJobPage.badge()}</span>
              <h1>{LL.editJobPage.title()}</h1>
              <p>
                {loading
                  ? LL.editJobPage.loading()
                  : user?.name
                  ? LL.editJobPage.updateAs(user.name)
                  : LL.editJobPage.updateDefault()}
              </p>
            </div>

            {!loading && (
              <form className="create-job-form" onSubmit={handleSubmit}>
                <div className="create-job-field">
                  <label htmlFor="title">{LL.editJobPage.titleLabel()}</label>
                  <input
                    id="title"
                    value={title}
                    readOnly
                    style={{opacity: 0.6, cursor: "not-allowed"}}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="location">{LL.editJobPage.locationLabel()}</label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder={LL.editJobPage.locationPlaceholder()}
                  />
                  <JobLocationValidator
                    location={location}
                    isValidated={locationValidated}
                    onConfirm={handleLocationConfirmed}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="employmentType">{LL.editJobPage.employmentTypeLabel()}</label>
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
                  <label htmlFor="description">{LL.editJobPage.descriptionLabel()}</label>
                  <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={LL.editJobPage.descriptionPlaceholder()}
                  />
                </div>

                <div className="create-job-field">
                  <label htmlFor="isActive">{LL.editJobPage.statusLabel()}</label>
                  <select
                    id="isActive"
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                  >
                    <option value="true">{LL.editJobPage.active()}</option>
                    <option value="false">{LL.editJobPage.deactivated()}</option>
                  </select>
                </div>

                {message && <div className="create-job-message">{message}</div>}

                <div className="create-job-actions">
                  <button
                    type="submit"
                    className="primary-home-button"
                    disabled={saving}
                  >
                    {saving ? LL.editJobPage.saving() : LL.editJobPage.saveChanges()}
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
