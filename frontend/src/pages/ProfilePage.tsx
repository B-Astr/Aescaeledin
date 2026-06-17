// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ProfilePage.css";
import { useI18nContext } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type UserProfile = {
  id: number;
  email: string;
  role: string;
  name: string | null;
  picture: string | null;
  otpEnabled: boolean;

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
  publicProfileVisible: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { LL } = useI18nContext();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [publicProfileVisible, setPublicProfileVisible] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "No se pudo cargar el perfil");
        }

        setUser(data.user);

        setName(data.user.name || "");
        setHeadline(data.user.headline || "");
        setBio(data.user.bio || "");
        setPhone(data.user.phone || "");
        setLocation(data.user.location || "");
        setWebsite(data.user.website || "");
        setLinkedinUrl(data.user.linkedinUrl || "");
        setGithubUrl(data.user.githubUrl || "");
        setExperience(data.user.experience || "");
        setEducation(data.user.education || "");
        setSkills(data.user.skills || "");
        setResumeUrl(data.user.resumeUrl || "");
        setPublicProfileVisible(Boolean(data.user.publicProfileVisible));
      })
      .catch((err) => {
        setError(String(err));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user_name");
        sessionStorage.removeItem("user_picture");
        sessionStorage.removeItem("user_role");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          headline,
          bio,
          phone,
          location,
          website,
          linkedinUrl,
          githubUrl,
          experience,
          education,
          skills,
          resumeUrl,
          publicProfileVisible,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el perfil");
      }

      setUser(data.user);

      if (data.user?.name) {
        sessionStorage.setItem("user_name", data.user.name);
      }

      setMessage(LL.profilePage.profileSaved());
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  function handleLocalLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("user_picture");
    sessionStorage.removeItem("user_role");
    navigate("/");
  }

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="profile-main">
          {loading ? (
            <div className="profile-card">
              <p className="profile-muted">{LL.profilePage.loading()}</p>
            </div>
          ) : error ? (
            <div className="profile-card">
              <h1 className="profile-title">{LL.profilePage.loadError()}</h1>
              <p className="profile-muted">{error}</p>
              <div className="profile-actions">
                <Link to="/login" className="nav-primary-button">
                  {LL.profilePage.goToLogin()}
                </Link>
              </div>
            </div>
          ) : user ? (
            <div className="profile-card">
              <div className="profile-header">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name ?? user.email}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback">
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="profile-header-text">
                  <span className="profile-badge">{LL.profilePage.myProfile()}</span>
                  <h1 className="profile-title">
                    {user.name || LL.profilePage.noName()}
                  </h1>
                  <p className="profile-subtitle">{user.email}</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>{LL.profilePage.nameLabel()}</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={LL.profilePage.namePlaceholder()}
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.headlineLabel()}</label>
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder={LL.profilePage.headlinePlaceholder()}
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.phoneLabel()}</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={LL.profilePage.phonePlaceholder()}
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.locationLabel()}</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={LL.profilePage.locationPlaceholder()}
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.websiteLabel()}</label>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.linkedinLabel()}</label>
                    <input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.githubLabel()}</label>
                    <input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="profile-field">
                    <label>{LL.profilePage.resumeLabel()}</label>
                    <input
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {user.role === "PRO" && (
                  <div className="profile-visibility-card">
                    <div>
                      <h2>{LL.profilePage.publicVisibilityTitle()}</h2>
                      <p>{LL.profilePage.publicVisibilityDesc()}</p>
                    </div>

                    <label className="profile-switch">
                      <input
                        type="checkbox"
                        checked={publicProfileVisible}
                        onChange={(event) =>
                          setPublicProfileVisible(event.target.checked)
                        }
                      />
                      <span className="profile-switch-track">
                        <span className="profile-switch-thumb" />
                      </span>
                      <span>
                        {publicProfileVisible
                          ? LL.profilePage.publicVisibilityOn()
                          : LL.profilePage.publicVisibilityOff()}
                      </span>
                    </label>
                  </div>
                )}

                <div className="profile-field profile-field-full">
                  <label>{LL.profilePage.bioLabel()}</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={LL.profilePage.bioPlaceholder()}
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label>{LL.profilePage.experienceLabel()}</label>
                  <textarea
                    rows={6}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder={LL.profilePage.experiencePlaceholder()}
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label>{LL.profilePage.educationLabel()}</label>
                  <textarea
                    rows={5}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder={LL.profilePage.educationPlaceholder()}
                  />
                </div>

                <div className="profile-field profile-field-full">
                  <label>{LL.profilePage.skillsLabel()}</label>
                  <textarea
                    rows={4}
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={LL.profilePage.skillsPlaceholder()}
                  />
                </div>

                {message && <div className="profile-message">{message}</div>}
                {error && <div className="profile-error">{error}</div>}

                <div className="profile-actions">
                  <Link to="/" className="nav-secondary-button">
                    {LL.profilePage.backHome()}
                  </Link>

                  <button
                    type="submit"
                    className="nav-primary-button"
                    disabled={saving}
                  >
                    {saving ? LL.profilePage.saving() : LL.profilePage.saveProfile()}
                  </button>

                  <button
                    type="button"
                    onClick={handleLocalLogout}
                    className="nav-secondary-button"
                  >
                    {LL.profilePage.logout()}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </main>

        <Footer />
      </div>
    </div>
  );
}
