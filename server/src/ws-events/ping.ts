import { WebSocket } from "ws";

export default function ping(ws: WebSocket, payload: any) {
    ws.send(JSON.stringify({ type: "pong", payload: null }));
}
