"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.corsOptions = void 0;
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const passport_config_1 = __importDefault(require("./middlewares/passport-config"));
const AuthRouter_1 = __importDefault(require("./routes/AuthRouter"));
const DashboardRouter_1 = __importDefault(require("./routes/DashboardRouter"));
const UserRouter_1 = __importDefault(require("./routes/UserRouter"));
const ParcelRouter_1 = __importDefault(require("./routes/ParcelRouter"));
const DriverRouter_1 = __importDefault(require("./routes/DriverRouter"));
const ShipperRouter_1 = __importDefault(require("./routes/ShipperRouter"));
const PublicParcelRouter_1 = __importDefault(require("./routes/PublicParcelRouter"));
const ReportRouter_1 = __importDefault(require("./routes/ReportRouter"));
const RoleRouter_1 = __importDefault(require("./routes/RoleRouter"));
const ExchangeRateRouter_1 = __importDefault(require("./routes/ExchangeRateRouter"));
const ReceptionRouter_1 = __importDefault(require("./routes/ReceptionRouter"));
const WarehouseRouter_1 = __importDefault(require("./routes/WarehouseRouter"));
const CityRouter_1 = __importDefault(require("./routes/CityRouter"));
const CountryRouter_1 = __importDefault(require("./routes/CountryRouter"));
const SetupRouter_1 = __importDefault(require("./routes/SetupRouter"));
const CSVRouter_1 = __importDefault(require("./routes/CSVRouter"));
const config_1 = require("./config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_1 = require("./socket");
const auth_1 = require("./middlewares/auth");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use(express_1.default.json());
app.use(passport_config_1.default.initialize());
exports.corsOptions = {
    origin: true,
    credentials: true,
};
app.use((0, cors_1.default)(exports.corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
// Connect to the database
(0, db_1.default)();
// Serve static files from the public directory for protected files
app.use("/protected-files", auth_1.authenticateJWT, express_1.default.static(path_1.default.join(__dirname, "public")));
// API routes
app.use("/api/auth", AuthRouter_1.default);
app.use("/api/dashboard", auth_1.authenticateJWT, DashboardRouter_1.default);
app.use("/api/users", auth_1.authenticateJWT, UserRouter_1.default);
app.use("/api/parcels", auth_1.authenticateJWT, ParcelRouter_1.default);
app.use("/api/drivers", auth_1.authenticateJWT, DriverRouter_1.default);
app.use("/api/shippers", auth_1.authenticateJWT, ShipperRouter_1.default);
app.use("/api/parcelId", PublicParcelRouter_1.default);
app.use("/api/report", auth_1.authenticateJWT, ReportRouter_1.default);
app.use("/api/roles", auth_1.authenticateJWT, RoleRouter_1.default);
app.use("/api/exchange-rates", auth_1.authenticateJWT, ExchangeRateRouter_1.default);
app.use("/api/warehouses", auth_1.authenticateJWT, WarehouseRouter_1.default);
app.use("/api/cities", auth_1.authenticateJWT, CityRouter_1.default);
app.use("/api/countries", auth_1.authenticateJWT, CountryRouter_1.default);
app.use("/setup", SetupRouter_1.default);
app.use("/api/csv", auth_1.authenticateJWT, CSVRouter_1.default);
app.use("/api/reception", auth_1.authenticateJWT, ReceptionRouter_1.default);
// Serve React's build files
const buildPath = path_1.default.join(__dirname, "..", "build"); // Adjust path if needed
app.use(express_1.default.static(buildPath));
// Handle all other routes with React's index.html (for client-side routing)
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(buildPath, "index.html"));
});
// Initialize the socket
const io = (0, socket_1.initializeSocket)(httpServer);
exports.io = io;
// Start the server
httpServer.listen(config_1.config.port, () => {
    console.log(`Server is running on port ${config_1.config.port}`);
});
