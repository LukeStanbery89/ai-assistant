import { injectable } from "tsyringe";
import { ConversationMessage, ConversationCommand, MessageIntent } from "../../../shared/types";
import { IConversationService } from "./IConversationService";

@injectable()
export class ConversationService implements IConversationService {
    private conversations: Map<string, ConversationMessage[]> = new Map();

    async processMessage(command: ConversationCommand): Promise<ConversationMessage> {
        const messageId = this.generateId();
        const timestamp = new Date();

        // Store user message
        const userMessage: ConversationMessage = {
            id: this.generateId(),
            type: "user",
            content: command.message,
            timestamp,
            sessionId: command.sessionId,
            userId: command.userId,
            clientType: command.clientType,
        };

        this.addMessageToHistory(command.sessionId, userMessage);

        // Generate simple response for now
        const response = this.generateSimpleResponse(command.message);

        const assistantMessage: ConversationMessage = {
            id: messageId,
            type: "assistant",
            content: response,
            timestamp: new Date(),
            sessionId: command.sessionId,
            userId: command.userId,
            clientType: command.clientType,
            metadata: {
                intent: MessageIntent.CHAT,
            },
        };

        this.addMessageToHistory(command.sessionId, assistantMessage);

        return assistantMessage;
    }

    async getConversationHistory(
        sessionId: string,
        userId: string,
    ): Promise<ConversationMessage[]> {
        return this.conversations.get(sessionId) || [];
    }

    private addMessageToHistory(sessionId: string, message: ConversationMessage): void {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }
        this.conversations.get(sessionId)!.push(message);
    }

    private generateSimpleResponse(userMessage: string): string {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
            return "Hello! How can I help you today?";
        }

        if (lowerMessage.includes("weather")) {
            return "I can help with weather information, but I need to be connected to a weather service first.";
        }

        if (lowerMessage.includes("help")) {
            return "I'm an AI assistant that can help with various tasks. Try asking me about the weather, or just have a conversation!";
        }

        return `You said: "${userMessage}". I'm a simple AI assistant and I'm still learning. How can I help you?`;
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
