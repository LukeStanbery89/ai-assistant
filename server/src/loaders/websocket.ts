import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { WebSocketEventPayload, ConversationCommand } from "../../../shared/types";
import { logger } from "../utils";

// Union type for all possible event payloads
type AllEventPayloads = WebSocketEventPayload | ConversationCommand;

type EventHandler = (ws: WebSocket, payload: AllEventPayloads) => void | Promise<void>;

interface WebSocketEventMap {
    [eventType: string]: EventHandler;
}

interface WebSocketOptions {
    events?: WebSocketEventMap;
    onConnection?: (ws: WebSocket) => void;
}

function defaultConnectionHandler(ws: WebSocket) {
    logger.info("WebSocket client connected", { clientIP: (ws as any).ip || "unknown" });
    ws.send(JSON.stringify({ type: "welcome", payload: "Welcome to the WebSocket server!" }));
}

export function initWebSocket(server: HTTPServer, options: WebSocketOptions = {}) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: WebSocket) => {
        (options.onConnection || defaultConnectionHandler)(ws);

        ws.on("message", (data: RawData) => {
            let msg;
            try {
                msg = JSON.parse(data.toString());
            } catch (error) {
                logger.error("WebSocket message parsing failed", {
                    error: error instanceof Error ? error.message : "Invalid JSON",
                    rawData: data.toString().substring(0, 100), // Log first 100 chars for debugging
                });
                ws.send(JSON.stringify({ type: "error", payload: "Invalid JSON" }));
                return;
            }

            logger.debug("Received WebSocket event", { type: msg.type, hasPayload: !!msg.payload });

            const { type, payload } = msg;
            const handler = options.events?.[type];
            if (handler) {
                handler(ws, payload);
            } else {
                logger.warn("Unknown WebSocket event type received", { type });
                ws.send(JSON.stringify({ type: "error", payload: `Unknown event type: ${type}` }));
            }
        });
    });

    return wss;
}
