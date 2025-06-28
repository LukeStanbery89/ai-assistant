import { WebSocket } from "ws";
import { WebSocketEventPayload, ConversationCommand } from "../../../shared/types";

export default function chat(ws: WebSocket, payload: WebSocketEventPayload | ConversationCommand) {
    console.log("Chat event:", payload);
    ws.send(JSON.stringify({ type: "chat_ack", payload: "Message received!" }));
}
