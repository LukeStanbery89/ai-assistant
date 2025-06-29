import { v4 as uuidv4 } from "uuid";
import type {
    ConversationCommand,
    ConversationMessage,
    ConversationEvent,
    ConversationResponseEvent,
    WebSocketEventTypes,
    ErrorEvent
} from "../../../shared/types";

export interface ChatWebSocketServiceConfig {
    url: string;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
}

export interface ConnectionStatus {
    connected: boolean;
    connecting: boolean;
    error?: string;
}

export class ChatWebSocketService {
    private ws: WebSocket | null = null;
    private config: ChatWebSocketServiceConfig;
    private reconnectAttempts = 0;
    private reconnectTimeoutId: NodeJS.Timeout | null = null;
    private messageListeners = new Set<(message: ConversationMessage) => void>();
    private errorListeners = new Set<(error: string) => void>();
    private connectionListeners = new Set<(status: ConnectionStatus) => void>();
    private sessionId: string;
    private userId: string;

    constructor(config: ChatWebSocketServiceConfig) {
        this.config = {
            reconnectDelay: 3000,
            maxReconnectAttempts: 5,
            ...config
        };
        this.sessionId = uuidv4();
        this.userId = "browser-user"; // TODO: Implement proper user identification
    }

    connect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        this.notifyConnectionListeners({ connected: false, connecting: true });

        try {
            this.ws = new WebSocket(this.config.url);

            this.ws.onopen = () => {
                console.log("WebSocket connected");
                this.reconnectAttempts = 0;
                this.notifyConnectionListeners({ connected: true, connecting: false });
            };

            this.ws.onmessage = (event) => {
                try {
                    const wsEvent: WebSocketEventTypes = JSON.parse(event.data);
                    this.handleMessage(wsEvent);
                } catch (error) {
                    console.error("Failed to parse WebSocket message:", error);
                    this.notifyErrorListeners("Failed to parse server message");
                }
            };

            this.ws.onclose = (event) => {
                console.log("WebSocket disconnected:", event.reason);
                this.notifyConnectionListeners({ connected: false, connecting: false });
                
                if (!event.wasClean && this.shouldReconnect()) {
                    this.scheduleReconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                this.notifyConnectionListeners({ 
                    connected: false, 
                    connecting: false, 
                    error: "Connection error" 
                });
                this.notifyErrorListeners("Connection error occurred");
            };

        } catch (error) {
            console.error("Failed to create WebSocket connection:", error);
            this.notifyConnectionListeners({ 
                connected: false, 
                connecting: false, 
                error: "Failed to connect" 
            });
        }
    }

    disconnect(): void {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.notifyConnectionListeners({ connected: false, connecting: false });
    }

    sendMessage(message: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not connected");
        }

        const command: ConversationCommand = {
            sessionId: this.sessionId,
            message,
            clientType: "browser",
            userId: this.userId
        };

        const event: ConversationEvent = {
            type: "conversation",
            payload: command
        };

        this.ws.send(JSON.stringify(event));
    }

    onMessage(listener: (message: ConversationMessage) => void): () => void {
        this.messageListeners.add(listener);
        return () => this.messageListeners.delete(listener);
    }

    onError(listener: (error: string) => void): () => void {
        this.errorListeners.add(listener);
        return () => this.errorListeners.delete(listener);
    }

    onConnectionChange(listener: (status: ConnectionStatus) => void): () => void {
        this.connectionListeners.add(listener);
        return () => this.connectionListeners.delete(listener);
    }

    getConnectionStatus(): ConnectionStatus {
        if (!this.ws) {
            return { connected: false, connecting: false };
        }

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return { connected: false, connecting: true };
            case WebSocket.OPEN:
                return { connected: true, connecting: false };
            case WebSocket.CLOSING:
            case WebSocket.CLOSED:
            default:
                return { connected: false, connecting: false };
        }
    }

    private handleMessage(event: WebSocketEventTypes): void {
        switch (event.type) {
            case "conversation_response": {
                const responseEvent = event as ConversationResponseEvent;
                this.notifyMessageListeners(responseEvent.payload);
                break;
            }
            
            case "error": {
                const errorEvent = event as ErrorEvent;
                this.notifyErrorListeners(errorEvent.payload.message);
                break;
            }
            
            case "pong":
                // Handle pong if needed for heartbeat
                break;
            
            default:
                console.log("Received unhandled WebSocket event:", event);
        }
    }

    private shouldReconnect(): boolean {
        return this.reconnectAttempts < (this.config.maxReconnectAttempts || 5);
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeoutId) {
            return;
        }

        this.reconnectAttempts++;
        const delay = this.config.reconnectDelay || 3000;

        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = null;
            this.connect();
        }, delay);
    }

    private notifyMessageListeners(message: ConversationMessage): void {
        this.messageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error("Error in message listener:", error);
            }
        });
    }

    private notifyErrorListeners(error: string): void {
        this.errorListeners.forEach(listener => {
            try {
                listener(error);
            } catch (err) {
                console.error("Error in error listener:", err);
            }
        });
    }

    private notifyConnectionListeners(status: ConnectionStatus): void {
        this.connectionListeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error("Error in connection listener:", error);
            }
        });
    }
}