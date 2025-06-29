import { CLIRepl } from "../CLIRepl";
import WebSocket from "ws";
import * as readline from "readline";

// Mock WebSocket
jest.mock("ws");
const MockWebSocket = WebSocket as jest.MockedClass<typeof WebSocket>;

// Mock readline
jest.mock("readline");
const mockReadline = readline as jest.Mocked<typeof readline>;

// Mock console methods to avoid test output
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();
const mockConsoleClean = jest.spyOn(console, "clear").mockImplementation();

// Mock process.exit
const mockProcessExit = jest.spyOn(process, "exit").mockImplementation();

describe("CLIRepl", () => {
    let mockWs: jest.Mocked<WebSocket>;
    let mockRl: jest.Mocked<readline.Interface>;
    let cliRepl: CLIRepl;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup readline mock
        mockRl = {
            on: jest.fn(),
            prompt: jest.fn(),
            close: jest.fn(),
        } as any;
        mockReadline.createInterface.mockReturnValue(mockRl);

        // Setup WebSocket mock
        mockWs = {
            on: jest.fn(),
            send: jest.fn(),
            close: jest.fn(),
            readyState: WebSocket.OPEN,
        } as any;
        MockWebSocket.mockImplementation(() => mockWs);

        cliRepl = new CLIRepl();
    });

    afterEach(() => {
        if (cliRepl) {
            cliRepl.cleanup();
        }
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
        mockConsoleClean.mockRestore();
        mockProcessExit.mockRestore();
    });

    describe("constructor", () => {
        it("should create readline interface with correct configuration", () => {
            expect(mockReadline.createInterface).toHaveBeenCalledWith({
                input: process.stdin,
                output: process.stdout,
                prompt: "> "
            });
        });

        it("should setup readline event handlers", () => {
            expect(mockRl.on).toHaveBeenCalledWith("line", expect.any(Function));
            expect(mockRl.on).toHaveBeenCalledWith("close", expect.any(Function));
        });
    });

    describe("start", () => {
        it("should display welcome message and create WebSocket connection", () => {
            // Mock successful connection (synchronous for testing)
            mockWs.on.mockImplementation((event, callback: any) => {
                if (event === "open") {
                    // Immediately call the callback to simulate connection
                    (callback as Function).call(mockWs);
                    (cliRepl as any).isConnected = true;
                }
                return mockWs;
            });

            // Start the REPL
            cliRepl.start();

            expect(mockConsoleLog).toHaveBeenCalledWith("🤖 AI Assistant CLI");
            expect(mockConsoleLog).toHaveBeenCalledWith("Connecting to server...");
            expect(MockWebSocket).toHaveBeenCalledWith("ws://localhost:3000");
        });
    });

    describe("readline event handling", () => {
        let lineHandler: (input: string) => void;

        beforeEach(() => {
            // Get the line handler that was registered
            const onCalls = mockRl.on.mock.calls;
            const lineCall = onCalls.find((call: any) => call[0] === "line");
            lineHandler = lineCall![1] as any;
        });

        it("should prompt again for empty input", () => {
            lineHandler("");
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it("should exit on quit command", () => {
            lineHandler("quit");
            expect(mockProcessExit).toHaveBeenCalledWith(0);
        });

        it("should exit on exit command", () => {
            lineHandler("exit");
            expect(mockProcessExit).toHaveBeenCalledWith(0);
        });

        it("should clear console on clear command", () => {
            lineHandler("clear");
            expect(mockConsoleClean).toHaveBeenCalled();
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it("should show not connected message when disconnected", () => {
            lineHandler("hello");
            expect(mockConsoleLog).toHaveBeenCalledWith("❌ Not connected to server. Please wait for connection...");
            expect(mockRl.prompt).toHaveBeenCalled();
        });
    });

    describe("WebSocket message handling", () => {
        it("should handle server messages by calling handleServerMessage", () => {
            // Get the message handler that was registered
            const onCalls = mockWs.on.mock.calls;
            const messageCall = onCalls.find((call: any) => call[0] === "message");
            
            if (messageCall) {
                const messageHandler = messageCall[1] as any;
                const mockResponse = {
                    type: "conversation_response",
                    payload: {
                        content: "Hello! How can I help you?"
                    }
                };

                // Call the handler with mock data
                messageHandler(Buffer.from(JSON.stringify(mockResponse)));

                // Verify the console output (the method processes the message)
                expect(mockConsoleLog).toHaveBeenCalledWith("\n🤖 Hello! How can I help you?\n");
            }
        });
    });

    describe("sendMessage", () => {
        let lineHandler: (input: string) => void;

        beforeEach(() => {
            // Get the line handler and simulate connection
            const onCalls = mockRl.on.mock.calls;
            const lineCall = onCalls.find((call: any) => call[0] === "line");
            lineHandler = lineCall![1] as any;

            // Simulate connected state
            (cliRepl as any).isConnected = true;
            (cliRepl as any).ws = mockWs;
        });

        it("should send properly formatted conversation command", () => {
            lineHandler("test message");

            expect(mockWs.send).toHaveBeenCalledWith(
                expect.stringContaining('"type":"conversation"')
            );
            expect(mockWs.send).toHaveBeenCalledWith(
                expect.stringContaining('"message":"test message"')
            );
            expect(mockWs.send).toHaveBeenCalledWith(
                expect.stringContaining('"clientType":"terminal"')
            );
            expect(mockConsoleLog).toHaveBeenCalledWith("⏳ Sending message...");
        });

        it("should not send message when not connected", () => {
            // Reset the connection state
            (cliRepl as any).isConnected = false;
            (cliRepl as any).ws = null;

            lineHandler("test message");

            expect(mockWs.send).not.toHaveBeenCalled();
            expect(mockConsoleLog).toHaveBeenCalledWith("❌ Not connected to server. Please wait for connection...");
        });

        it("should prevent multiple concurrent messages", () => {
            // Set waiting state
            (cliRepl as any).isWaitingForResponse = true;

            lineHandler("test message");

            expect(mockWs.send).not.toHaveBeenCalled();
            expect(mockConsoleLog).toHaveBeenCalledWith("⏳ Please wait for the current response...");
        });
    });
});