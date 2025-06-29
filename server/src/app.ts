import "reflect-metadata";
import "dotenv/config";
import express from "express";
import indexRoutes from "./routes";
import http from "http";
import { initLoaders } from "./loaders";
import { logger } from "./utils";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", indexRoutes);

const PORT = process.env.PORT || 4000;

// Create HTTP server and attach Express app
const server = http.createServer(app);

// Initialize all loaders (DI, WebSocket, etc.)
initLoaders(server);

server.listen(PORT, () => {
    logger.info("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
    });
});
