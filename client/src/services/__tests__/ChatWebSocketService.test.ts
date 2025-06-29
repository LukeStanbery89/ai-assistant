import { ChatWebSocketService } from "../ChatWebSocketService";
import type { ConversationResponseEvent, ErrorEvent } from "../../../../shared/types";

// Mock WebSocket
class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    readyState = MockWebSocket.CONNECTING;
    onopen: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;

    constructor(public url: string) {}

    send(data: string) {
        if (this.readyState !== MockWebSocket.OPEN) {
            throw new Error("WebSocket is not open");
        }
        // Data parameter is intentionally unused in mock
        void data;
    }

    close() {
        this.readyState = MockWebSocket.CLOSED;
        if (this.onclose) {
            this.onclose(new CloseEvent("close", { wasClean: true }));
        }
    }

    // Test helpers
    simulateOpen() {
        this.readyState = MockWebSocket.OPEN;
        if (this.onopen) {
            this.onopen(new Event("open"));
        }
    }

    simulateMessage(data: string) {
        if (this.onmessage) {
            this.onmessage(new MessageEvent("message", { data }));
        }
    }

    simulateError() {
        if (this.onerror) {
            this.onerror(new Event("error"));
        }
    }
}

// Mock global WebSocket
Object.defineProperty(window, "WebSocket", {
    writable: true,
    value: MockWebSocket
});

describe("ChatWebSocketService", () => {
    let service: ChatWebSocketService;
    let mockWs: MockWebSocket;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Suppress console output during tests
        consoleSpy = jest.spyOn(console, "log").mockImplementation();
        jest.spyOn(console, "error").mockImplementation();
        
        service = new ChatWebSocketService({ url: "ws://localhost:3000" });
        // Get the mock WebSocket instance after connection
        service.connect();
        mockWs = (service as unknown as { ws: MockWebSocket }).ws;
    });

    afterEach(() => {
        service.disconnect();
        consoleSpy.mockRestore();
    });

    describe("connection management", () => {
        it("should connect to WebSocket server", () => {
            expect(mockWs).toBeInstanceOf(MockWebSocket);
            expect(mockWs.url).toBe("ws://localhost:3000");
        });

        it("should notify connection listeners on open", () => {
            const connectionListener = jest.fn();
            service.onConnectionChange(connectionListener);

            mockWs.simulateOpen();

            expect(connectionListener).toHaveBeenCalledWith({
                connected: true,
                connecting: false
            });
        });

        it("should notify connection listeners on close", () => {
            const connectionListener = jest.fn();
            service.onConnectionChange(connectionListener);
            
            mockWs.simulateOpen();
            connectionListener.mockClear();
            
            mockWs.close();

            expect(connectionListener).toHaveBeenCalledWith({
                connected: false,
                connecting: false
            });
        });

        it("should handle connection errors", () => {
            const connectionListener = jest.fn();
            const errorListener = jest.fn();
            
            service.onConnectionChange(connectionListener);
            service.onError(errorListener);

            mockWs.simulateError();

            expect(connectionListener).toHaveBeenCalledWith({
                connected: false,
                connecting: false,
                error: "Connection error"
            });
            expect(errorListener).toHaveBeenCalledWith("Connection error occurred");
        });
    });

    describe("message handling", () => {
        beforeEach(() => {
            mockWs.simulateOpen();
        });

        it("should send messages when connected", () => {
            const sendSpy = jest.spyOn(mockWs, "send");
            
            service.sendMessage("Hello world");

            expect(sendSpy).toHaveBeenCalledWith(
                expect.stringContaining('"type":"conversation"')
            );
            
            const callArg = sendSpy.mock.calls[0][0];
            const parsedPayload = JSON.parse(callArg);
            expect(parsedPayload.payload.message).toBe("Hello world");
            expect(parsedPayload.payload.clientType).toBe("browser");
            expect(parsedPayload.payload.userId).toBe("browser-user");
        });

        it("should throw error when sending message while disconnected", () => {
            mockWs.readyState = MockWebSocket.CLOSED;

            expect(() => {
                service.sendMessage("Hello world");
            }).toThrow("WebSocket not connected");
        });

        it("should handle conversation response messages", () => {
            const messageListener = jest.fn();
            service.onMessage(messageListener);

            const responseEvent: ConversationResponseEvent = {
                type: "conversation_response",
                payload: {
                    id: "test-123",
                    type: "assistant",
                    content: "Hello back!",
                    timestamp: new Date(),
                    sessionId: "session-123",
                    userId: "user-123",
                    clientType: "browser"
                }
            };

            mockWs.simulateMessage(JSON.stringify(responseEvent));

            expect(messageListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "test-123",
                    type: "assistant",
                    content: "Hello back!",
                    sessionId: "session-123",
                    userId: "user-123",
                    clientType: "browser"
                })
            );
        });

        it("should handle error messages", () => {
            const errorListener = jest.fn();
            service.onError(errorListener);

            const errorEvent: ErrorEvent = {
                type: "error",
                payload: {
                    message: "Something went wrong"
                }
            };

            mockWs.simulateMessage(JSON.stringify(errorEvent));

            expect(errorListener).toHaveBeenCalledWith("Something went wrong");
        });

        it("should handle malformed messages gracefully", () => {
            const errorListener = jest.fn();
            service.onError(errorListener);

            mockWs.simulateMessage("invalid json");

            expect(errorListener).toHaveBeenCalledWith("Failed to parse server message");
        });
    });

    describe("cleanup", () => {
        it("should remove listeners when unsubscribed", () => {
            const messageListener = jest.fn();
            const unsubscribe = service.onMessage(messageListener);

            unsubscribe();

            const responseEvent: ConversationResponseEvent = {
                type: "conversation_response",
                payload: {
                    id: "test-123",
                    type: "assistant",
                    content: "Hello back!",
                    timestamp: new Date(),
                    sessionId: "session-123",
                    userId: "user-123",
                    clientType: "browser"
                }
            };

            mockWs.simulateMessage(JSON.stringify(responseEvent));

            expect(messageListener).not.toHaveBeenCalled();
        });

        it("should clean up on disconnect", () => {
            const closeSpy = jest.spyOn(mockWs, "close");
            
            service.disconnect();

            expect(closeSpy).toHaveBeenCalled();
        });
    });
});