import { WebSocket } from "ws";
import { WebSocketEventPayload, ConversationCommand } from "../../../shared/types";

export default function ping(ws: WebSocket, payload: WebSocketEventPayload | ConversationCommand) {
    ws.send(JSON.stringify({ type: "pong", payload: null }));
}
