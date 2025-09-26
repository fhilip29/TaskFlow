import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/db";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4002;

// ✅ Security Middleware
app.use(helmet());

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ✅ Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB();

// ✅ Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow Project Service API",
      version: "1.0.0",
      description:
        "Project and Team Management Service for TaskFlow - handles project creation, member management, and collaboration features.",
      contact: {
        name: "TaskFlow Development Team",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ✅ Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TaskFlow Project Service API Documentation",
  })
);

// ✅ Import routes
import projectRoutes from "./routes/project.routes";

// ✅ Mount routes
app.use("/api/projects", projectRoutes);

// ✅ Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "TaskFlow Project Service API is running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/",
      docs: "/api-docs",
      projects: "/api/projects",
    },
  });
});

// ✅ API Info endpoint
app.get("/api/info", (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: "project-service",
    version: "1.0.0",
    description: "Project and Team Management Service",
    features: [
      "Project CRUD operations",
      "Member management",
      "Role-based permissions",
      "Invitation system with QR codes",
      "Project search and filtering",
      "Integration with User and Task services",
    ],
    documentation: "/api-docs",
  });
});

// ✅ 404 handler for all unmatched routes (must be last)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    availableEndpoints: {
      projects: "/api/projects",
      documentation: "/api-docs",
      info: "/api/info",
    },
  });
});

// ✅ Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error handler:", err);

  // MongoDB duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate value error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Duplicate entry",
    });
  }

  // Validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Invalid data",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Project Service running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/api-docs`
  );
  console.log(`🔍 Health check at http://localhost:${PORT}`);
});

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

// ✅ Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
