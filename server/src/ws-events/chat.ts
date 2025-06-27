import { WebSocket } from "ws";
import { WebSocketEventPayload } from "../../../shared/types";

export default function chat(ws: WebSocket, payload: WebSocketEventPayload) {
    console.log("Chat event:", payload);
    ws.send(JSON.stringify({ type: "chat_ack", payload: "Message received!" }));
}
