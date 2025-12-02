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
import { brandRouter } from "@routes/brand.routes";
import { productGroupRouter } from "@routes/productGroup.routes";
import { productVariantRouter } from "@routes/productVariant.routes";
import unitRouter from "@routes/unit.routes";
import { customerRouter } from "@routes/customer.routes";
import { customerGroupRouter } from "@routes/customerGroup.routes";
import { newsletterRouter } from "@routes/newsletter.routes";
import { customerAuthRouter } from "@routes/customerAuth.routes";
import { warehouseRouter } from "@routes/warehouse.routes";
import { supplierRouter } from "@routes/supplier.routes";
import { stockLotRouter } from "@routes/stockLot.routes";
import { stockAdjustmentRouter } from "@routes/stockAdjustment.routes";
import { stockRouter } from "@routes/stock.routes";
import { internalTransferRouter } from "@routes/internalTransfer.routes";
import { invoiceRouter } from "@routes/invoice.routes";
import { barcodeRouter } from "@routes/barcode.routes";
import { staffRouter } from "@routes/staff.routes";

const app = express();

const allowedOrigins = [
  "http://dootling.com",
  "https://dootling.com",
  "https://www.dootling.com",
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
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
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://unpkg.com",
        ],
        connectSrc: [
          "'self'",
          "https://unpkg.com",
          "http://localhost:8000",
          "https://localhost:8000",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      },
    },
  })
);
app.use(cors(corsOptions));

// Allow all origins for Swagger docs
app.use("/docs", cors());
app.use("/swagger.json", cors());
app.use("/swagger.yml", cors());
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
app.use("/api/brands", brandRouter);
app.use("/api/product-groups", productGroupRouter);
app.use("/api/product-variants", productVariantRouter);
app.use("/api", unitRouter);
app.use("/api", customerRouter);
app.use("/api", customerGroupRouter);
app.use("/api", newsletterRouter);
app.use("/storefront", customerAuthRouter);
app.use("/api/warehouses", warehouseRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/stock-lots", stockLotRouter);
app.use("/api/stock-adjustments", stockAdjustmentRouter);
app.use("/api/stocks", stockRouter);
app.use("/api/internal-transfers", internalTransferRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/barcodes", barcodeRouter);
app.use("/api/staff", staffRouter);

app.get("/health", async (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", message: "Service is healthy" });
});

app.use(errorHandler);

export default app;
