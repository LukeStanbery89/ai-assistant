import { WebSocket } from "ws";

export default function chat(ws: WebSocket, payload: any) {
    console.log("Chat event:", payload);
    ws.send(JSON.stringify({ type: "chat_ack", payload: "Message received!" }));
}
