import { handleConversation } from "../src/ws-events/conversation";
import { ConversationCommand, ConversationMessage } from "../../shared/types";
import { container } from "tsyringe";
import { IConversationService } from "../src/service/IConversationService";

// Mock WebSocket
const mockWs = {
    send: jest.fn(),
};

// Mock ConversationService
const mockConversationService = {
    processMessage: jest.fn(),
    getConversationHistory: jest.fn(),
};

// Mock container resolution
jest.mock("tsyringe", () => ({
    container: {
        resolve: jest.fn(),
    },
}));

describe("WebSocket conversation handler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (container.resolve as jest.Mock).mockReturnValue(mockConversationService);
    });

    describe("handleConversation", () => {
        it("should process valid conversation command", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Hello",
                clientType: "terminal",
                userId: "test-user",
            };

            const expectedResponse: ConversationMessage = {
                id: "test-id",
                type: "assistant",
                content: "Hello! How can I help you today?",
                timestamp: new Date(),
                sessionId: "test-session",
                userId: "test-user",
                clientType: "terminal",
            };

            mockConversationService.processMessage.mockResolvedValue(expectedResponse);

            await handleConversation(mockWs as any, command);

            expect(container.resolve).toHaveBeenCalledWith("IConversationService");
            expect(mockConversationService.processMessage).toHaveBeenCalledWith(command);
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "conversation_response",
                    payload: expectedResponse,
                }),
            );
        });

        it("should reject invalid payload with error message", async () => {
            const invalidPayload = "invalid string payload";

            await handleConversation(mockWs as any, invalidPayload);

            expect(mockConversationService.processMessage).not.toHaveBeenCalled();
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Invalid conversation command format",
                        error: "Expected ConversationCommand object",
                    },
                }),
            );
        });

        it("should reject null payload", async () => {
            await handleConversation(mockWs as any, null);

            expect(mockConversationService.processMessage).not.toHaveBeenCalled();
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Invalid conversation command format",
                        error: "Expected ConversationCommand object",
                    },
                }),
            );
        });

        it("should reject object missing required fields", async () => {
            const incompleteCommand = {
                sessionId: "test-session",
                message: "Hello",
                // missing clientType and userId
            };

            await handleConversation(mockWs as any, incompleteCommand as any);

            expect(mockConversationService.processMessage).not.toHaveBeenCalled();
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Invalid conversation command format",
                        error: "Expected ConversationCommand object",
                    },
                }),
            );
        });

        it("should handle service errors gracefully", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Hello",
                clientType: "terminal",
                userId: "test-user",
            };

            const error = new Error("Service unavailable");
            mockConversationService.processMessage.mockRejectedValue(error);

            // Mock console.error to avoid test output
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            await handleConversation(mockWs as any, command);

            expect(consoleSpy).toHaveBeenCalledWith("Error handling conversation:", error);
            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Failed to process message",
                        error: "Service unavailable",
                    },
                }),
            );

            consoleSpy.mockRestore();
        });

        it("should handle unknown errors gracefully", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Hello",
                clientType: "terminal",
                userId: "test-user",
            };

            mockConversationService.processMessage.mockRejectedValue("unknown error");

            // Mock console.error to avoid test output
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            await handleConversation(mockWs as any, command);

            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Failed to process message",
                        error: "Unknown error",
                    },
                }),
            );

            consoleSpy.mockRestore();
        });
    });
});
