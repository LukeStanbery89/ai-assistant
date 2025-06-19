import { Server as HTTPServer } from "http";
import { initWebSocket } from "./websocket";
import { initDI } from "./di";
import wsEvents from "../ws-events";

export function initLoaders(server: HTTPServer) {
    initDI();
    initWebSocket(server, {
        events: wsEvents,
    });
}
