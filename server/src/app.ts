import "reflect-metadata";
import "dotenv/config";
import express from "express";
import indexRoutes from "./routes";
import { container } from "tsyringe";
import http from "http";
import { initLoaders } from "./loaders";
import { DIDemoService } from "./service/impl/DIDemoService";

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
    console.log(`Server running on port ${PORT}`);

    container.resolve(DIDemoService).demo();
});
