import { WebSocket } from "ws";
import { ConversationCommand, WebSocketEventPayload } from "../../../shared/types";

// Union type for all possible event payloads
type AllEventPayloads = WebSocketEventPayload | ConversationCommand;

export type EventHandler = (ws: WebSocket, payload: AllEventPayloads) => void | Promise<void>;

// Import all handlers here
import chat from "./chat";
import ping from "./ping";
import { handleConversation } from "./conversation";

// Map event type to handler
const events: Record<string, EventHandler> = {
    chat,
    ping,
    conversation: handleConversation,
};

export default events;
