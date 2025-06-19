import { WebSocket } from "ws";

export type EventHandler = (ws: WebSocket, payload: any) => void;

// Import all handlers here
import chat from "./chat";
import ping from "./ping";

// Map event type to handler
const events: Record<string, EventHandler> = {
    chat,
    ping,
};

export default events;
