// frontend/src/pages/AboutPage.tsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./HomePage.css";
import { useI18nContext } from "../i18n";

export default function AboutPage() {
  const { LL } = useI18nContext();
  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <main className="home-center">
          <div style={{ maxWidth: "900px", textAlign: "center" }}>
            <h1 className="home-title">{LL.about.about()}</h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "16px",
                lineHeight: "1.8",
                margin: "24px 0 0",
              }}
            >
              {LL.about.bigtext1()}
            </p>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "16px",
                lineHeight: "1.8",
                margin: "18px 0 0",
              }}
            >
              {LL.about.bigtext2()}
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}