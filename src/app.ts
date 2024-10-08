import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";
import passport from "./middlewares/passport-config";
import authRoutes from "./routes/AuthRouter";
import dashboardRoutes from "./routes/DashboardRouter";
import userRoutes from "./routes/UserRouter";
import parcelRoutes from "./routes/ParcelRouter";
import driverRoutes from "./routes/DriverRouter";
import shipperRoutes from "./routes/ShipperRouter";
import publicParcelRouters from "./routes/PublicParcelRouter";
import reportRoutes from "./routes/ReportRouter";
import roleRoutes from "./routes/RoleRouter";
import exchangeRateRoutes from "./routes/ExchangeRateRouter";
import receptionRoutes from "./routes/ReceptionRouter";
import warehouseRoutes from "./routes/WarehouseRouter";
import cityRoutes from "./routes/CityRouter";
import countryRoutes from "./routes/CountryRouter";
import setupRoutes from "./routes/SetupRouter";
import csvRoutes from "./routes/CSVRouter";
import { config } from "./config";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { initializeSocket } from "./socket";
import { authenticateJWT } from "./middlewares/auth";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(passport.initialize());

const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Serve static files from the public directory for protected files
app.use(
  "/protected-files",
  authenticateJWT,
  express.static(path.join(__dirname, "public"))
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/parcels", authenticateJWT, parcelRoutes);
app.use("/api/drivers", authenticateJWT, driverRoutes);
app.use("/api/shippers", authenticateJWT, shipperRoutes);
app.use("/api/parcelId", publicParcelRouters);
app.use("/api/report", authenticateJWT, reportRoutes);
app.use("/api/roles", authenticateJWT, roleRoutes);
app.use("/api/exchange-rates", authenticateJWT, exchangeRateRoutes);
app.use("/api/warehouses", authenticateJWT, warehouseRoutes);
app.use("/api/cities", authenticateJWT, cityRoutes);
app.use("/api/countries", authenticateJWT, countryRoutes);
app.use("/setup", setupRoutes);
app.use("/api/csv", authenticateJWT, csvRoutes);
app.use("/api/reception", authenticateJWT, receptionRoutes);

// Serve React's build files
const buildPath = path.join(__dirname, "..", "build");  // Adjust path if needed
app.use(express.static(buildPath));

// Handle all other routes with React's index.html (for client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Initialize the socket
const io = initializeSocket(httpServer);

// Start the server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export { io };
