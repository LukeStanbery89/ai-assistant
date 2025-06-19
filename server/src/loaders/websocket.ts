import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

type EventHandler = (ws: WebSocket, payload: any) => void;

interface WebSocketEventMap {
    [eventType: string]: EventHandler;
}

interface WebSocketOptions {
    events?: WebSocketEventMap;
    onConnection?: (ws: WebSocket) => void;
}

function defaultConnectionHandler(ws: WebSocket) {
    console.log("WebSocket client connected");
    ws.send(JSON.stringify({ type: "welcome", payload: "Welcome to the WebSocket server!" }));
}

export function initWebSocket(server: HTTPServer, options: WebSocketOptions = {}) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        (options.onConnection || defaultConnectionHandler)(ws);

        ws.on("message", (data) => {
            let msg;
            try {
                msg = JSON.parse(data.toString());
            } catch {
                ws.send(JSON.stringify({ type: "error", payload: "Invalid JSON" }));
                return;
            }
            const { type, payload } = msg;
            const handler = options.events?.[type];
            if (handler) {
                handler(ws, payload);
            } else {
                ws.send(JSON.stringify({ type: "error", payload: `Unknown event type: ${type}` }));
            }
        });
    });

    return wss;
}
