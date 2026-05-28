// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";
import { TypesafeI18n, detectLocale } from "./i18n";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  throw new Error("Falta VITE_GOOGLE_CLIENT_ID en frontend/.env");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <TypesafeI18n initialLocale={detectLocale()}>
        <App />
      </TypesafeI18n>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
