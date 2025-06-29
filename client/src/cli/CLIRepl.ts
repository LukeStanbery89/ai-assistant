import * as readline from "readline";
import WebSocket from "ws";
import { randomUUID } from "crypto";
import type { ConversationCommand, ConversationMessage, WebSocketEventTypes } from "../../../shared/types";

export class CLIRepl {
    // WebSocket starts as null and is initialized during connection
    private ws: WebSocket | null = null;
    private rl: readline.Interface;
    private sessionId: string;
    private userId: string;
    private isConnected = false;
    private isWaitingForResponse = false;
    private connectionTimeout: NodeJS.Timeout | null = null;
    private isShuttingDown = false;

    // Connection timeout constant
    private static readonly CONNECTION_TIMEOUT_MS = 5000;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = "cli-user-" + Date.now();

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "> "
        });

        this.setupReadline();
    }

    private setupReadline(): void {
        this.rl.on("line", (input: string) => {
            const trimmedInput = input.trim();

            if ("" === trimmedInput) {
                this.rl.prompt();
                return;
            }

            if ("exit" === trimmedInput || "quit" === trimmedInput) {
                this.shutdown();
                return;
            }

            if ("clear" === trimmedInput) {
                console.clear();
                this.rl.prompt();
                return;
            }

            if (!this.isConnected) {
                console.log("❌ Not connected to server. Please wait for connection...");
                this.rl.prompt();
                return;
            }

            if (this.isWaitingForResponse) {
                console.log("⏳ Please wait for the current response...");
                this.rl.prompt();
                return;
            }

            this.sendMessage(trimmedInput);
        });

        this.rl.on("close", () => {
            this.shutdown();
        });
    }

    public async start(): Promise<void> {
        console.log("🤖 AI Assistant CLI");
        console.log("Connecting to server...");

        await this.connectToServer();

        if (this.isConnected) {
            console.log("✅ Connected! Type your message and press Enter.");
            console.log("Commands: exit, quit, clear");
            console.log("");
            this.rl.prompt();
        } else {
            console.log("❌ Failed to connect to server.");
            process.exit(1);
        }
    }

    private connectToServer(): Promise<void> {
        return new Promise((resolve) => {
            // TODO: Read WebSocket address/port from config or .env file
            this.ws = new WebSocket("ws://localhost:3000");

            this.ws.on("open", () => {
                console.log("🔗 WebSocket connected");
                this.isConnected = true;
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                resolve();
            });

            this.ws.on("message", (data: WebSocket.Data) => {
                try {
                    const event: WebSocketEventTypes = JSON.parse(data.toString());
                    this.handleServerMessage(event);
                } catch (error) {
                    console.log("❌ Error parsing server message:", error);
                }
            });

            this.ws.on("close", () => {
                console.log("\n💔 Connection to server lost");
                this.isConnected = false;
                if (!this.isWaitingForResponse) {
                    this.rl.prompt();
                }
            });

            this.ws.on("error", (error) => {
                console.log("\n❌ WebSocket error:", error.message);
                this.isConnected = false;
                if (this.connectionTimeout) {
                    clearTimeout(this.connectionTimeout);
                    this.connectionTimeout = null;
                }
                resolve();
            });

            // Timeout after configured duration
            this.connectionTimeout = setTimeout(() => {
                if (!this.isConnected) {
                    console.log("⏰ Connection timeout");
                    resolve();
                }
            }, CLIRepl.CONNECTION_TIMEOUT_MS);
        });
    }

    private handleServerMessage(event: WebSocketEventTypes): void {
        if ("conversation_response" === event.type) {
            const message = event.payload as ConversationMessage;
            console.log(`\n🤖 ${message.content}\n`);
            this.isWaitingForResponse = false;
            this.rl.prompt();
        } else if ("error" === event.type) {
            console.log(`\n❌ Error: ${event.payload.message}\n`);
            this.isWaitingForResponse = false;
            this.rl.prompt();
        }
    }

    private sendMessage(message: string): void {
        if (!this.ws || WebSocket.OPEN !== this.ws.readyState) {
            console.log("❌ Not connected to server");
            this.rl.prompt();
            return;
        }

        const command: ConversationCommand = {
            sessionId: this.sessionId,
            message,
            clientType: "terminal",
            userId: this.userId
        };

        this.ws.send(JSON.stringify({
            type: "conversation",
            payload: command
        }));

        this.isWaitingForResponse = true;
        console.log("⏳ Sending message...");
    }

    private shutdown(): void {
        // Shutting down flag prevents double "Goodbye" message
        if (this.isShuttingDown) {
            return;
        }
        this.isShuttingDown = true;

        console.log("\n👋 Goodbye!");
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
        }
        this.rl.close();
        process.exit(0);
    }

    private generateSessionId(): string {
        return "cli-session-" + randomUUID();
    }

    public cleanup(): void {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }
        if (this.ws) {
            this.ws.close();
        }
        this.rl.close();
    }
}