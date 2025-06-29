import { ChatModule } from "../src/service/modules/impl/ChatModule";
import { ParsedInputs, MessageIntent } from "../../shared/types";

describe("ChatModule", () => {
    let chatModule: ChatModule;

    beforeEach(() => {
        chatModule = new ChatModule();
    });

    describe("properties", () => {
        it("should have correct intent", () => {
            expect(chatModule.intent).toBe(MessageIntent.CHAT);
        });
    });

    describe("canHandle", () => {
        it("should return true for CHAT intent", () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: {},
            };

            expect(chatModule.canHandle(inputs)).toBe(true);
        });

        it("should return false for non-CHAT intent", () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.WEATHER,
                parameters: {},
            };

            expect(chatModule.canHandle(inputs)).toBe(false);
        });
    });

    describe("execute", () => {
        it("should respond to hello messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "hello" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe("Hello! How can I help you today?");
            expect(result.data.response).toBe("Hello! How can I help you today?");
            expect(result.metadata?.intent).toBe(MessageIntent.CHAT);
            expect(result.metadata?.timestamp).toBeDefined();
        });

        it("should respond to hi messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "hi there" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe("Hello! How can I help you today?");
        });

        it("should respond to how are you messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "how are you doing?" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe("I'm doing well, thank you for asking! How are you?");
        });

        it("should respond to thank you messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "thank you very much" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe(
                "You're welcome! Is there anything else I can help you with?",
            );
        });

        it("should respond to goodbye messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "bye" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe("Goodbye! Have a great day!");
        });

        it("should provide default response for unknown messages", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: "random question" },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe(
                "I understand you said: \"random question\". I'm still learning, but I'm here to help! What would you like to talk about?",
            );
        });

        it("should handle empty message parameter", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: {},
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe(
                "I understand you said: \"\". I'm still learning, but I'm here to help! What would you like to talk about?",
            );
        });

        it("should handle non-string message parameter", async () => {
            const inputs: ParsedInputs = {
                intent: MessageIntent.CHAT,
                parameters: { message: null },
            };

            const result = await chatModule.execute(inputs);

            expect(result.success).toBe(true);
            expect(result.message).toBe(
                "I understand you said: \"\". I'm still learning, but I'm here to help! What would you like to talk about?",
            );
        });
    });
});
