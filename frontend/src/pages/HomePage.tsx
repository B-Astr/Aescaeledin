// frontend/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./HomePage.css";
import { useI18nContext } from "../i18n";
import { usePageMeta } from "../lib/usePageMeta";

export default function HomePage() {
  const { LL } = useI18nContext();
  usePageMeta("ASCALEdin", "Plataforma de empleos y servicios profesionales.");
  const isLoggedIn = !!sessionStorage.getItem("token");

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="home-center">
          <h1 className="home-title">Ascaledin</h1>

          {isLoggedIn ? (
            <Link to="/profile" className="primary-home-button">
              {LL.homePage.goToProfile()}
            </Link>
          ) : (
            <Link to="/login" className="primary-home-button">
              {LL.homePage.getStarted()}
            </Link>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
