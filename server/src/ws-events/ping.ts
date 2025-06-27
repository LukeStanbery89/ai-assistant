import { WebSocket } from "ws";
import { WebSocketEventPayload } from "../../../shared/types";

export default function ping(ws: WebSocket, payload: WebSocketEventPayload) {
    ws.send(JSON.stringify({ type: "pong", payload: null }));
}
