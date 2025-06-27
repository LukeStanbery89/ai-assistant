import { WebSocket } from "ws";

export type EventHandler = (ws: WebSocket, payload: WebSocketEventPayload) => void;

// Import all handlers here
import chat from "./chat";
import ping from "./ping";
import { WebSocketEventPayload } from "../../../shared/types";

// Map event type to handler
const events: Record<string, EventHandler> = {
    chat,
    ping,
};

export default events;
