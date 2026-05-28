// frontend/src/components/Footer.tsx
import { Link } from "react-router-dom";
import { useI18nContext } from "../i18n";

export default function Footer() {
  const { LL } = useI18nContext();
  return (
    <footer className="home-footer">
      <div className="home-footer-content">
        <div className="footer-left">
          <div className="footer-logo">
            <div className="home-logo-dot" />
            <span>Ascaledin</span>
          </div>

          <p className="footer-description">
            {LL.footer.description()}
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>{LL.footer.product()}</h4>
            <Link to="/info">{LL.footer.info()}</Link>
            <Link to="/jobs">{LL.footer.jobs()}</Link>
          </div>

          <div>
            <h4>{LL.footer.company()}</h4>
            <Link to="/about">{LL.footer.about()}</Link>
          </div>

          <div>
            <h4>{LL.footer.account()}</h4>
            <Link to="/profile">{LL.footer.profil()}</Link>
            <Link to="/login">{LL.footer.login()}</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Ascaledin
      </div>
    </footer>
  );
}
