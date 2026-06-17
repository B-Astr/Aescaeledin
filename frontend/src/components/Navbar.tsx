// frontend/src/components/Navbar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";
import { useI18nContext } from '../i18n';
import NavbarSearch from "./NavbarSearch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type CurrentTab =
  | "home"
  | "about"
  | "info"
  | "jobs"
  | "professionals"
  | "companies"
  | "profile"
  | "my_applications"
  | "login"
  | "company_jobs"
  | "company_jobs_new"
  | "company_requests"
  | "pro_services"
  | "pro_services_new";

type MeResponseUser = {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  picture?: string | null;
  otpEnabled?: boolean;
};

export default function Navbar() {
  const { LL, locale, setLocale } = useI18nContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = sessionStorage.getItem("token");
      const storedName = sessionStorage.getItem("user_name");

      setIsLoggedIn(!!token);

      if (!token) {
        setUserName(null);
        setUserRole(null);
        return;
      }

      if (storedName) {
        setUserName(storedName);
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("No se pudo cargar el usuario");
        }

        const data: { user?: MeResponseUser } = await res.json();
        const freshName = data.user?.name ?? null;
        const freshRole = data.user?.role ?? null;

        if (freshName) {
          sessionStorage.setItem("user_name", freshName);
          setUserName(freshName);
        } else if (!storedName) {
          setUserName(null);
        }

        setUserRole(freshRole);
      } catch {
        if (!storedName) {
          setUserName(null);
        }
        setUserRole(null);
      }
    }

    loadUser();
  }, [location.pathname]);

  function closeMenu() {
    setMenuOpen(false);
    setDesktopMenuOpen(false);
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("user_picture");
    sessionStorage.removeItem("user_role");
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    setMenuOpen(false);
    setDesktopMenuOpen(false);
    setDesktopSearchOpen(false);
    navigate("/");
  }

  function getCurrentTab(): CurrentTab {
    const path = location.pathname.toLowerCase();

    if (path === "/") return "home";
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/info")) return "info";
    if (path === "/jobs") return "jobs";
    if (path === "/professionals") return "professionals";
    if (path.startsWith("/professionals/")) return "professionals";
    if (path === "/companies") return "companies";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/my-applications")) return "my_applications";
    if (path.startsWith("/login")) return "login";

    if (path === "/company/jobs") return "company_jobs";
    if (path.startsWith("/company/jobs/new")) return "company_jobs_new";
    if (path.startsWith("/company/jobs/")) return "company_jobs";
    if (path === "/company/requests") return "company_requests";

    if (path === "/pro/services") return "pro_services";
    if (path.startsWith("/pro/services/new")) return "pro_services_new";
    if (path.startsWith("/pro/services/")) return "pro_services";

    return "home";
  }

  const currentTab = getCurrentTab();

  function tabClass(tab: CurrentTab) {
    return `home-tab ${currentTab === tab ? "active" : ""}`;
  }

  const isCompany = isLoggedIn && userRole === "EMPRESA";
  const isProfessional = isLoggedIn && userRole === "PRO";
  const isClient = isLoggedIn && userRole === "CLIENTE";
  const isMenuActive =
    currentTab === "jobs" ||
    currentTab === "professionals" ||
    currentTab === "companies" ||
    currentTab === "company_jobs" ||
    currentTab === "company_jobs_new" ||
    currentTab === "company_requests" ||
    currentTab === "my_applications" ||
    currentTab === "pro_services" ||
    currentTab === "pro_services_new";

  const menuButtonClass = `home-tab navbar-menu-button ${
    desktopMenuOpen || isMenuActive ? "active" : ""
  }`;

  return (
    <header
      className={`home-navbar ${desktopSearchOpen ? "navbar-search-open" : ""}`}
    >
      <div className="home-navbar-top">
        <div className="home-navbar-brand">
          <div className="home-logo-dot" />
          <span className="home-logo-text">Ascaledin</span>
        </div>

        <nav className="home-navbar-tabs desktop-only">
          {!desktopSearchOpen && (
            <>
              <Link to="/" className={tabClass("home")}>
                {LL.navbar.home()}
              </Link>

              <Link to="/about" className={tabClass("about")}>
                {LL.navbar.about()}
              </Link>

              <Link to="/info" className={tabClass("info")}>
                {LL.navbar.info()}
              </Link>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/jobs" className={tabClass("jobs")}>
                {LL.navbar.jobs()}
              </Link>

              <Link to="/professionals" className={tabClass("professionals")}>
                {LL.navbar.professionals()}
              </Link>

              <Link to="/companies" className={tabClass("companies")}>
                {LL.navbar.companies()}
              </Link>
            </>
          ) : (
            <div className="navbar-menu-wrapper">
              <button
                type="button"
                className={menuButtonClass}
                onClick={() => setDesktopMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={desktopMenuOpen}
              >
                <span className="navbar-menu-icon" aria-hidden="true">
                  ☰
                </span>
                <span>{LL.navbar.menu()}</span>
                <span className="navbar-menu-arrow" aria-hidden="true">
                  {desktopMenuOpen ? "▴" : "▾"}
                </span>
              </button>

              <div
                className={`navbar-menu-dropdown ${
                  desktopMenuOpen ? "open" : ""
                }`}
              >
                {desktopSearchOpen && (
                  <>
                    <Link
                      to="/"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.navbar.home()}
                    </Link>

                    <Link
                      to="/about"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.navbar.about()}
                    </Link>

                    <Link
                      to="/info"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.navbar.info()}
                    </Link>

                    <div className="navbar-menu-divider" />
                  </>
                )}

                <Link
                  to="/jobs"
                  className="navbar-menu-item"
                  onClick={closeMenu}
                >
                  {LL.navbar.jobs()}
                </Link>

                <Link
                  to="/professionals"
                  className="navbar-menu-item"
                  onClick={closeMenu}
                >
                  {LL.navbar.professionals()}
                </Link>

                <Link
                  to="/companies"
                  className="navbar-menu-item"
                  onClick={closeMenu}
                >
                  {LL.navbar.companies()}
                </Link>

                {isClient && (
                  <>
                    <div className="navbar-menu-divider" />
                    <Link
                      to="/my-applications"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbsesionIniciada.myApplications()}
                    </Link>
                  </>
                )}

                {isProfessional && (
                  <>
                    <div className="navbar-menu-divider" />
                    <Link
                      to="/pro/services"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbpro.proPanel()}
                    </Link>
                    <Link
                      to="/pro/services/new"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbpro.createService()}
                    </Link>
                  </>
                )}

                {isCompany && (
                  <>
                    <div className="navbar-menu-divider" />
                    <Link
                      to="/company/jobs"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbcompany.companyPanel()}
                    </Link>
                    <Link
                      to="/company/jobs/new"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbcompany.createJob()}
                    </Link>
                    <Link
                      to="/company/requests"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbcompany.directApplications()}
                    </Link>
                  </>
                )}

                {desktopSearchOpen && (
                  <>
                    <div className="navbar-menu-divider" />
                    <Link
                      to="/profile"
                      className="navbar-menu-item"
                      onClick={closeMenu}
                    >
                      {LL.nbsesionIniciada.profil()}
                    </Link>
                    <button
                      type="button"
                      className="navbar-menu-item navbar-menu-action"
                      onClick={() => {
                        setLocale(locale === 'es' ? 'en' : 'es');
                        setDesktopMenuOpen(false);
                      }}
                    >
                      {locale === 'es' ? "EN" : "ES"}
                    </button>
                    <button
                      type="button"
                      className="navbar-menu-item navbar-menu-action"
                      onClick={handleLogout}
                    >
                      {LL.nbsesionIniciada.logout()}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        <div className="home-navbar-actions desktop-only">
          {isLoggedIn && (
            <NavbarSearch onOpenChange={setDesktopSearchOpen} />
          )}

          {isLoggedIn && !desktopSearchOpen && (
            <Link to="/profile" className="nav-secondary-button">
              {LL.nbsesionIniciada.profil()}
            </Link>
          )}

          {isLoggedIn && !desktopSearchOpen && userName && (
            <span className="navbar-user-name">{userName}</span>
          )}

          {(!isLoggedIn || !desktopSearchOpen) && (
            <button
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              className="nav-secondary-button"
            >
              {locale === 'es' ? "EN" : "ES"}
            </button>
          )}

          {isLoggedIn && !desktopSearchOpen ? (
            <button onClick={handleLogout} className="nav-primary-button">
              {LL.nbsesionIniciada.logout()}
            </button>
          ) : !isLoggedIn ? (
            <>
              <Link to="/login?mode=login" className="nav-secondary-button">
                {LL.nbsesionIniciada.signin()}
              </Link>
              <Link to="/login?mode=register" className="nav-primary-button">
                {LL.loginPage.createAccountOption()}
              </Link>
            </>
          ) : null}
        </div>

        <button
          className={`home-menu-toggle mobile-only ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          aria-label={LL.navbar.openMenu()}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`home-navbar-bottom ${menuOpen ? "open" : ""}`}>
        <nav className="home-navbar-tabs mobile-tabs">
          <Link to="/" className={tabClass("home")} onClick={closeMenu}>
            {LL.navbar.home()}
          </Link>

          <Link to="/about" className={tabClass("about")} onClick={closeMenu}>
            {LL.navbar.about()}
          </Link>

          <Link to="/info" className={tabClass("info")} onClick={closeMenu}>
            {LL.navbar.info()}
          </Link>

          {!isLoggedIn && (
            <>
              <Link to="/jobs" className={tabClass("jobs")} onClick={closeMenu}>
                {LL.navbar.jobs()}
              </Link>

              <Link
                to="/professionals"
                className={tabClass("professionals")}
                onClick={closeMenu}
              >
                {LL.navbar.professionals()}
              </Link>

              <Link
                to="/companies"
                className={tabClass("companies")}
                onClick={closeMenu}
              >
                {LL.navbar.companies()}
              </Link>
            </>
          )}
        </nav>

        <div className="home-navbar-actions mobile-actions">
          {isLoggedIn && (
            <>
              <Link to="/jobs" className="nav-secondary-button" onClick={closeMenu}>
                {LL.navbar.jobs()}
              </Link>

              <Link
                to="/professionals"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.navbar.professionals()}
              </Link>

              <Link
                to="/companies"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.navbar.companies()}
              </Link>
            </>
          )}

          {isLoggedIn && userName && (
            <div className="mobile-user-name">{userName}</div>
          )}

          {isCompany && (
            <>
              <Link
                to="/company/jobs"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbcompany.companyPanel()}
              </Link>

              <Link
                to="/company/jobs/new"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbcompany.createJob()}
              </Link>

              <Link
                to="/company/jobs"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbcompany.myJobs()}
              </Link>
            </>
          )}

          {isClient && (
            <Link
              to="/my-applications"
              className="nav-secondary-button"
              onClick={closeMenu}
            >
              {LL.nbsesionIniciada.myApplications()}
            </Link>
          )}

          {isProfessional && (
            <>
              <Link
                to="/pro/services"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbpro.proPanel()}
              </Link>

              <Link
                to="/pro/services/new"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbpro.createService()}
              </Link>
            </>
          )}

          {isLoggedIn && (
            <NavbarSearch mobile onNavigate={closeMenu} />
          )}

          {isLoggedIn && (
            <Link
              to="/profile"
              className="nav-secondary-button"
              onClick={closeMenu}
            >
              {LL.nbsesionIniciada.profil()}
            </Link>
          )}

          <button
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="nav-secondary-button"
          >
            {locale === 'es' ? "EN" : "ES"}
          </button>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="nav-primary-button">
              {LL.nbsesionIniciada.logout()}
            </button>
          ) : (
            <>
              <Link
                to="/login?mode=login"
                className="nav-secondary-button"
                onClick={closeMenu}
              >
                {LL.nbsesionIniciada.signin()}
              </Link>
              <Link
                to="/login?mode=register"
                className="nav-primary-button"
                onClick={closeMenu}
              >
                {LL.loginPage.createAccountOption()}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
