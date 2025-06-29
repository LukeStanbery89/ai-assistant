import { Server as HTTPServer } from "http";
import { initWebSocket } from "./websocket";
import { initDI } from "./di";
import wsEvents from "../ws-events";
import { logger } from "../utils";

export function initLoaders(server: HTTPServer) {
    logger.info("Initializing application loaders");

    initDI();

    logger.debug("Initializing WebSocket server", {
        eventTypes: Object.keys(wsEvents),
    });
    initWebSocket(server, {
        events: wsEvents,
    });

    logger.info("Application loaders initialized successfully");
}
