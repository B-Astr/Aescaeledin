// frontend/src/pages/Login.tsx
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useI18nContext } from "../i18n";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type AuthMode = "login" | "register" | null;
type RegisterRole = "CLIENTE" | "EMPRESA" | "PRO";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { LL } = useI18nContext();
  const modeParam = searchParams.get("mode");
  const initialMode: AuthMode =
    modeParam === "register" || modeParam === "login" ? modeParam : null;

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>("CLIENTE");
  const [pendingToken, setPendingToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingOtpSetup, setLoadingOtpSetup] = useState(false);
  const [loadingOtpVerify, setLoadingOtpVerify] = useState(false);
  const [step, setStep] = useState<"login" | "verify" | "success">("login");

  // [SEGURIDAD] Contador de intentos OTP fallidos.
  // Si el usuario se equivoca 5 veces, lo mandamos de vuelta al inicio.
  // Así evitamos que alguien intente adivinar el código por fuerza bruta.
  const [otpAttempts, setOtpAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;

  useEffect(() => {
    const mode = searchParams.get("mode");

    if (mode === "register" || mode === "login") {
      setAuthMode(mode);
      setMessage("");
    }
  }, [searchParams]);

  async function sendGoogleToken(token: string) {
    if (!authMode) {
      setMessage(LL.loginPage.chooseMode());
      return;
    }

    try {
      setLoadingGoogle(true);
      setMessage(
        authMode === "login"
          ? LL.loginPage.signingInWithGoogle()
          : LL.loginPage.creatingAccountWithGoogle()
      );

      const body: {
        idToken: string;
        intent: "login" | "register";
        role?: RegisterRole;
      } = {
        idToken: token,
        intent: authMode,
      };

      if (authMode === "register") {
        body.role = selectedRole;
      }

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "No se pudo continuar");
      }

      if (data.pendingToken) {
        setPendingToken(data.pendingToken);

        if (data.user?.name) {
          // [SEGURIDAD] Utiliza sessionStorage en vez de localStorage.
          // La diferencia: sessionStorage se borra solo cuando cierras el navegador.
          // localStorage queda para siempre lo cual suele ser mas riesgoso (Ataque XSS).
          sessionStorage.setItem("user_name", data.user.name);
        }
        if (data.user?.picture) {
          sessionStorage.setItem("user_picture", data.user.picture);
        }

        setMessage(
          authMode === "register"
            ? LL.loginPage.accountCreatedOtp()
            : LL.loginPage.accountValidatedOtp()
        );

        await setupOtp(data.pendingToken);
        setStep("verify");
        return;
      }

      if (data.token) {
        sessionStorage.setItem("token", data.token);

        if (data.user?.name) {
          sessionStorage.setItem("user_name", data.user.name);
        }
        if (data.user?.picture) {
          sessionStorage.setItem("user_picture", data.user.picture);
        }

        setMessage(
          authMode === "register"
            ? LL.loginPage.accountCreatedDone()
            : LL.loginPage.signInDone()
        );
        setStep("success");

        setTimeout(() => {
          navigate("/");
        }, 1200);

        return;
      }

      setMessage(LL.loginPage.unexpectedFlow());
    } catch (error) {
      // [SEGURIDAD] Nunca hay que mostrar el error real al usuario.
      // Si mostramos el error tecnico, le estamos dando pistas al atacante de como esta armada tu app por dentro.
      console.error(error);
      setMessage(LL.loginPage.genericError());
    } finally {
      setLoadingGoogle(false);
    }
  }

  async function setupOtp(token: string) {
    try {
      setLoadingOtpSetup(true);

      const res = await fetch(`${API_URL}/api/auth/otp/setup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "No se pudo generar el QR OTP"
        );
      }

      if (data.qrCodeDataUrl) {
        setQrCodeDataUrl(data.qrCodeDataUrl);
      }
    } catch (error) {
      // [SEGURIDAD] mensaje generico al usuario, error real en consola.
      console.error(error);
      setMessage(LL.loginPage.qrSetupError());
    } finally {
      setLoadingOtpSetup(false);
    }
  }

  async function verifyOtp() {
    // [SEGURIDAD] Si ya se equivoco hay que aplicar MAX_ATTEMPTS, con esto cortaremos el flujo.
    // Sin esto, un hacker probar los 1.000.000 de combinaciones.
    if (otpAttempts >= MAX_ATTEMPTS) {
      setMessage(LL.loginPage.tooManyAttempts());
      setStep("login");
      setOtpAttempts(0);
      return;
    }

    if (!pendingToken.trim()) {
      setMessage(LL.loginPage.noPendingToken());
      return;
    }

    // [SEGURIDAD] Validamos el formato antes de mandar una request.
    // con esto evitaremos enviar basura al servidor y podremos dar un feedback mas claro.
    const OTP_REGEX = /^\d{6}$/;
    if (!OTP_REGEX.test(otpCode.trim())) {
      setMessage(LL.loginPage.invalidOtpFormat());
      return;
    }

    try {
      setLoadingOtpVerify(true);
      setMessage(LL.loginPage.verifyingOtp());

      const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingToken}`,
        },
        body: JSON.stringify({ code: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        // [SEGURIDAD] Incrementamos el contador en cada intento fallido
        // y le avisamos al usuario cuantos intentos le quedan.
        setOtpAttempts((prev) => prev + 1);
        const remaining = MAX_ATTEMPTS - (otpAttempts + 1);

        setMessage(
          remaining > 0
            ? LL.loginPage.otpIncorrectRemaining(remaining)
            : LL.loginPage.tooManyAttempts()
        );

        if (remaining <= 0) {
          setStep("login");
          setPendingToken("");
          setOtpCode("");
          setQrCodeDataUrl("");
          setOtpAttempts(0);
        }

        return;
      }

      if (data.token) {
        sessionStorage.setItem("token", data.token);

        if (data.user?.name) {
          sessionStorage.setItem("user_name", data.user.name);
        }
        if (data.user?.picture) {
          sessionStorage.setItem("user_picture", data.user.picture);
        }

        // [SEGURIDAD] Limpiamos los datos sensibles del estado de React una vez que ya no los necesitaras.
        // Asi no quedan en la memoria mas tiempo del necesario.
        setPendingToken("");
        setOtpCode("");
        setQrCodeDataUrl("");
        setOtpAttempts(0);

        setMessage(LL.loginPage.verificationDone());
        setStep("success");

        setTimeout(() => {
          navigate("/");
        }, 1200);

        return;
      }

      setMessage(LL.loginPage.noFinalToken());
    } catch (error) {
      // [SEGURIDAD] Error generico al usuario, real en consola (error comun, no tanta importancia en vulnerabilidad realmente).
      setOtpAttempts((prev) => prev + 1);
      console.error(error);
      setMessage(LL.loginPage.genericError());
    } finally {
      setLoadingOtpVerify(false);
    }
  }

  return (
    <div className="home-page">
      <div className="home-background-glow home-background-glow-1" />
      <div className="home-background-glow home-background-glow-2" />

      <div className="home-shell">
        <Navbar />

        <div className="login-shell">
          <div className="login-card">
            <div className="login-header">
              <div className="login-badge">{LL.loginPage.secureBadge()}</div>
              <h1>
                {authMode === "register"
                  ? LL.loginPage.createAccountTitle()
                  : LL.loginPage.signInTitle()}
              </h1>
              <p>
                {authMode === "register"
                  ? LL.loginPage.registerDesc()
                  : LL.loginPage.signInDesc()}
              </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <Link to="/" className="back-home-link">
                {LL.loginPage.backHome()}
              </Link>
            </div>

            {step === "login" && (
              <section className="login-section">
                <div className="auth-mode-switch">
                  <button
                    type="button"
                    className={`auth-mode-option ${
                      authMode === "login" ? "active" : ""
                    }`}
                    onClick={() => {
                      setAuthMode("login");
                      setMessage("");
                    }}
                  >
                    {LL.loginPage.signInOption()}
                  </button>

                  <button
                    type="button"
                    className={`auth-mode-option ${
                      authMode === "register" ? "active" : ""
                    }`}
                    onClick={() => {
                      setAuthMode("register");
                      setMessage("");
                    }}
                  >
                    {LL.loginPage.createAccountOption()}
                  </button>
                </div>

                {authMode && (
                  <>
                    <div className="section-top centered">
                      <h2>
                        {authMode === "login"
                          ? LL.loginPage.googleAccess()
                          : LL.loginPage.googleRegister()}
                      </h2>
                      <p>
                        {authMode === "login"
                          ? LL.loginPage.existingAccountDesc()
                          : LL.loginPage.newAccountDesc()}
                      </p>
                    </div>

                    {authMode === "register" && (
                      <div className="role-picker">
                        <p className="role-picker-label">
                          {LL.loginPage.registerAs()}
                        </p>

                        <div className="role-picker-buttons">
                          <button
                            type="button"
                            className={`role-option ${
                              selectedRole === "CLIENTE" ? "active" : ""
                            }`}
                            onClick={() => setSelectedRole("CLIENTE")}
                          >
                            {LL.loginPage.client()}
                          </button>

                          <button
                            type="button"
                            className={`role-option ${
                              selectedRole === "EMPRESA" ? "active" : ""
                            }`}
                            onClick={() => setSelectedRole("EMPRESA")}
                          >
                            {LL.loginPage.company()}
                          </button>

                          <button
                            type="button"
                            className={`role-option ${
                              selectedRole === "PRO" ? "active" : ""
                            }`}
                            onClick={() => setSelectedRole("PRO")}
                          >
                            {LL.loginPage.professional()}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="google-box">
                      <GoogleLogin
                        onSuccess={(res) => {
                          if (!res.credential) {
                            setMessage(LL.loginPage.noCredentials());
                            return;
                          }
                          sendGoogleToken(res.credential);
                        }}
                        onError={() => {
                          setMessage(
                            authMode === "login"
                              ? LL.loginPage.googleSignInError()
                              : LL.loginPage.googleRegisterError()
                          );
                        }}
                      />
                    </div>

                    {loadingGoogle && (
                      <p className="helper-text">
                        {authMode === "login"
                          ? LL.loginPage.processingSignIn()
                          : LL.loginPage.processingCreateAccount()}
                      </p>
                    )}
                  </>
                )}
              </section>
            )}

            {step === "verify" && (
              <section className="login-section">
                <div className="section-top centered">
                  <h2>{LL.loginPage.otpVerification()}</h2>
                  <p>{LL.loginPage.otpScanDesc()}</p>
                </div>

                {loadingOtpSetup ? (
                  <p className="helper-text">{LL.loginPage.generatingQR()}</p>
                ) : (
                  qrCodeDataUrl && (
                    <div className="qr-wrapper">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR OTP"
                        className="qr-image"
                      />
                    </div>
                  )
                )}

                <div className="otp-verify-block">
                  <label htmlFor="otpCode">{LL.loginPage.otpCodeLabel()}</label>
                  <input
                    id="otpCode"
                    type="text"
                    placeholder={LL.loginPage.otpPlaceholder()}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                  />

                  <button
                    className="primary-button full-width"
                    onClick={verifyOtp}
                    disabled={loadingOtpVerify}
                  >
                    {loadingOtpVerify
                      ? LL.loginPage.verifying()
                      : LL.loginPage.verifyCode()}
                  </button>
                </div>
              </section>
            )}

            {step === "success" && (
              <section className="login-section success-section">
                <div className="success-icon">✓</div>
                <h2>
                  {authMode === "register"
                    ? LL.loginPage.accountCreatedSuccess()
                    : LL.loginPage.signInSuccess()}
                </h2>
                <p>{LL.loginPage.accountVerified()}</p>
              </section>
            )}

            {message && <div className="status-message">{message}</div>}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
