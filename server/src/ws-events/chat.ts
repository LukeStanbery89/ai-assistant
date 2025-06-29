import { WebSocket } from "ws";
import { WebSocketEventPayload, ConversationCommand } from "../../../shared/types";
import { logger } from "../utils";

export default function chat(ws: WebSocket, payload: WebSocketEventPayload | ConversationCommand) {
    logger.info("Chat event received", { payload });
    ws.send(JSON.stringify({ type: "chat_ack", payload: "Message received!" }));
}
