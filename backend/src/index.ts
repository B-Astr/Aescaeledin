// backend/src/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { sequelize } from "./config/db";
import authRoutes from "./routes/auth.routes";
import companyJobsRoutes from "./routes/companyJobs.routes";
import jobApplicationsRoutes from "./routes/jobApplications.routes";

import professionalServicesRoutes from "./routes/professionalServices.routes";
import "./models/ProfessionalService";

import "./models/User";
import "./models/JobPost";
import "./models/JobApplication";

import professionalServiceSelectionsRoutes from "./routes/professionalServiceSelections.routes";
import "./models/ProfessionalServiceSelection";

import companyRequestsRoutes from "./routes/companyRequests.routes";
import "./models/CompanyRequest";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Backend Bun + TypeScript funcionando",
  });
});

app.get("/health", async (_req, res) => {
  try {
    await sequelize.authenticate();

    return res.json({
      ok: true,
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health DB error:", error);

    return res.status(500).json({
      ok: false,
      db: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api", companyJobsRoutes);
app.use("/api", jobApplicationsRoutes);
app.use("/api", professionalServicesRoutes);
app.use("/api", professionalServiceSelectionsRoutes);
app.use("/api", companyRequestsRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Base de datos conectada correctamente");

    await sequelize.sync();
    console.log("Modelos sincronizados correctamente");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
