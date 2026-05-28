// frontend/src/pages/InfoPage.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./InfoPage.css";
import { useI18nContext } from "../i18n";

export default function InfoPage() {
  const { LL } = useI18nContext();

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="info-main">
          <section className="info-hero">
            <span className="info-badge">{LL.infoPage.badge()}</span>
            <h1>{LL.infoPage.title()}</h1>
            <p>{LL.infoPage.subtitle()}</p>
          </section>

          <section className="info-grid">
            <article className="info-card">
              <h2>{LL.infoPage.designTitle()}</h2>
              <p>{LL.infoPage.designDesc()}</p>
            </article>

            <article className="info-card">
              <h2>{LL.infoPage.scalabilityTitle()}</h2>
              <p>{LL.infoPage.scalabilityDesc()}</p>
            </article>

            <article className="info-card">
              <h2>{LL.infoPage.experienceTitle()}</h2>
              <p>{LL.infoPage.experienceDesc()}</p>
            </article>

            <article className="info-card">
              <h2>{LL.infoPage.securityTitle()}</h2>
              <p>{LL.infoPage.securityDesc()}</p>
            </article>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
