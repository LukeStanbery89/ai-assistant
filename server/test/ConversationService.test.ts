import { ConversationService } from "../src/service/impl/ConversationService";
import { ConversationCommand, MessageIntent, IntentParseResult } from "../../shared/types";
import { IIntentParser } from "../src/service/IIntentParser";
import { ILLMService } from "../src/service/ILLMService";

// Mock implementations
const mockIntentParser: jest.Mocked<IIntentParser> = {
    parseIntent: jest.fn(),
    isHealthy: jest.fn(),
    getVersion: jest.fn(),
};

const mockLLMService: jest.Mocked<ILLMService> = {
    generateResponse: jest.fn(),
    isHealthy: jest.fn(),
    getVersion: jest.fn(),
};

describe("ConversationService", () => {
    let conversationService: ConversationService;

    beforeEach(() => {
        jest.clearAllMocks();
        conversationService = new ConversationService(mockIntentParser, mockLLMService);

        // Set up default mock responses
        mockIntentParser.parseIntent.mockResolvedValue({
            intent: MessageIntent.CHAT,
            parameters: {},
            confidence: 0.8,
            entities: [],
            sentiment: "neutral",
        });

        mockLLMService.generateResponse.mockResolvedValue("Hello! How can I help you today?");
    });

    describe("processMessage", () => {
        it("should process a simple message and return assistant response", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Hello",
                clientType: "terminal",
                userId: "test-user",
            };

            const response = await conversationService.processMessage(command);

            expect(response).toMatchObject({
                type: "assistant",
                content: "Hello! How can I help you today?",
                sessionId: "test-session",
                userId: "test-user",
                clientType: "terminal",
                metadata: {
                    intent: MessageIntent.CHAT,
                },
            });
            expect(response.id).toBeDefined();
            expect(response.timestamp).toBeInstanceOf(Date);
        });

        it("should respond with weather message for weather queries", async () => {
            // Set up weather intent response
            mockIntentParser.parseIntent.mockResolvedValue({
                intent: MessageIntent.GET_WEATHER,
                parameters: { location: "Chicago" },
                confidence: 0.95,
                entities: [
                    { name: "location", value: "Chicago", confidence: 0.95, type: "location" },
                ],
                sentiment: "neutral",
            });
            mockLLMService.generateResponse.mockResolvedValue(
                "I'd love to help you check the weather in Chicago! Once I'm connected to a weather service, I'll be able to provide real-time forecasts.",
            );

            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "What is the weather like in Chicago?",
                clientType: "browser",
                userId: "test-user",
            };

            const response = await conversationService.processMessage(command);

            expect(mockIntentParser.parseIntent).toHaveBeenCalledWith(
                command.message,
                command.context,
            );
            expect(mockLLMService.generateResponse).toHaveBeenCalledWith(
                MessageIntent.GET_WEATHER,
                { location: "Chicago" },
                command.message,
                command.context,
            );
            expect(response.metadata?.intent).toBe(MessageIntent.GET_WEATHER);
            expect(response.metadata?.confidence).toBe(0.95);
        });

        it("should respond with help message for help queries", async () => {
            // Set up help intent response
            mockIntentParser.parseIntent.mockResolvedValue({
                intent: MessageIntent.CHAT,
                parameters: {},
                confidence: 0.9,
                entities: [],
                sentiment: "neutral",
            });
            mockLLMService.generateResponse.mockResolvedValue(
                "I'm your AI assistant and I'm here to help! Here's what I can do: weather, smart home control, web search, reminders, and chat.",
            );

            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "help me",
                clientType: "terminal",
                userId: "test-user",
            };

            const response = await conversationService.processMessage(command);

            expect(mockIntentParser.parseIntent).toHaveBeenCalledWith(
                command.message,
                command.context,
            );
            expect(mockLLMService.generateResponse).toHaveBeenCalledWith(
                MessageIntent.CHAT,
                {},
                command.message,
                command.context,
            );
            expect(response.metadata?.intent).toBe(MessageIntent.CHAT);
        });

        it("should provide default response for unknown messages", async () => {
            // Default mock is already set up for CHAT intent
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "random message",
                clientType: "terminal",
                userId: "test-user",
            };

            const response = await conversationService.processMessage(command);

            expect(mockIntentParser.parseIntent).toHaveBeenCalledWith(
                command.message,
                command.context,
            );
            expect(mockLLMService.generateResponse).toHaveBeenCalledWith(
                MessageIntent.CHAT,
                {},
                command.message,
                command.context,
            );
            expect(response.metadata?.intent).toBe(MessageIntent.CHAT);
            expect(response.content).toBe("Hello! How can I help you today?");
        });

        it("should store conversation history", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Hello",
                clientType: "terminal",
                userId: "test-user",
            };

            await conversationService.processMessage(command);
            const history = await conversationService.getConversationHistory(
                "test-session",
                "test-user",
            );

            expect(history).toHaveLength(2); // user message + assistant response
            expect(history[0].type).toBe("user");
            expect(history[0].content).toBe("Hello");
            expect(history[1].type).toBe("assistant");
        });
    });

    describe("getConversationHistory", () => {
        it("should return empty array for non-existent session", async () => {
            const history = await conversationService.getConversationHistory(
                "non-existent",
                "user",
            );
            expect(history).toEqual([]);
        });

        it("should return conversation history for existing session", async () => {
            const command: ConversationCommand = {
                sessionId: "test-session",
                message: "Test message",
                clientType: "terminal",
                userId: "test-user",
            };

            await conversationService.processMessage(command);
            const history = await conversationService.getConversationHistory(
                "test-session",
                "test-user",
            );

            expect(history).toHaveLength(2);
            expect(history[0].content).toBe("Test message");
        });
    });
});
