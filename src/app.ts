import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import redocExpress from "redoc-express";
import YAML from "yamljs";
import path from "path";
import fs from "fs";
import { errorHandler } from "@middlewares/error.middleware";

import { authRouter } from "@routes/auth.routes";
import { storeRouter } from "@routes/store.routes";
import { kycRouter } from "@routes/kyc.routes";
import { userRouter } from "@routes/user.routes";
import { productRouter } from "@routes/product.routes";
import { categoryRouter } from "@routes/category.routes";

const app = express();

const allowedOrigins = [
  "http://dootling.com",
  "https://dootling.com",
  "https://www.dootling.com",
  "http://localhost:3000",
  "http://localhost:3002",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        connectSrc: ["'self'", "https://unpkg.com"],
      },
    },
  })
);
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load Swagger YAML file

const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yml"));

// Swagger UI endpoint
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Dootling API Documentation",
  })
);

// ReDoc endpoint (root)
app.get(
  "/",
  redocExpress({
    title: "Dootling API Documentation",
    specUrl: "/swagger.json",
  })
);

// Serve the swagger spec as JSON
app.get("/swagger.json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Also serve at /swagger.yml for compatibility
app.get("/swagger.yml", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/store", storeRouter);
app.use("/api/kyc", kycRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);

app.get("/health", async (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", message: "Service is healthy" });
});

app.use(errorHandler);

export default app;