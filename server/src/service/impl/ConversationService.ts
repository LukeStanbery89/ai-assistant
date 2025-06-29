import { injectable, inject } from "tsyringe";
import { ConversationMessage, ConversationCommand } from "../../../../shared/types";
import { IConversationService } from "../IConversationService";
import { IIntentParser } from "../IIntentParser";
import { ILLMService } from "../ILLMService";
import { logger } from "../../utils";

@injectable()
export class ConversationService implements IConversationService {
    private conversations: Map<string, ConversationMessage[]> = new Map();

    constructor(
        @inject("IIntentParser") private intentParser: IIntentParser,
        @inject("ILLMService") private llmService: ILLMService,
    ) { }

    async processMessage(command: ConversationCommand): Promise<ConversationMessage> {
        const messageId = this.generateId();
        const timestamp = new Date();

        logger.info("Processing conversation message", {
            sessionId: command.sessionId,
            userId: command.userId,
            clientType: command.clientType,
            messageLength: command.message.length,
        });

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

        try {
            // Parse intent from user message
            const parseResult = await this.intentParser.parseIntent(
                command.message,
                command.context,
            );

            logger.debug("Intent parsed", {
                intent: parseResult.intent,
                confidence: parseResult.confidence,
                entityCount: parseResult.entities.length,
            });

            // Generate LLM response based on intent and parameters
            const responseContent = await this.llmService.generateResponse(
                parseResult.intent,
                parseResult.parameters,
                command.message,
                command.context,
            );

            const assistantMessage: ConversationMessage = {
                id: messageId,
                type: "assistant",
                content: responseContent,
                timestamp: new Date(),
                sessionId: command.sessionId,
                userId: command.userId,
                clientType: command.clientType,
                metadata: {
                    intent: parseResult.intent,
                    confidence: parseResult.confidence,
                    entities: parseResult.entities,
                    processingTime: Date.now() - timestamp.getTime(),
                },
            };

            this.addMessageToHistory(command.sessionId, assistantMessage);

            logger.info("Message processed successfully", {
                intent: parseResult.intent,
                confidence: parseResult.confidence,
                processingTime: assistantMessage.metadata?.processingTime,
            });

            return assistantMessage;
        } catch (error) {
            logger.error("Failed to process conversation message", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
                payload: command,
            });

            // Fallback response for errors
            const fallbackMessage: ConversationMessage = {
                id: messageId,
                type: "assistant",
                content:
                    "I apologize, but I'm having trouble processing your message right now. Could you please try again?",
                timestamp: new Date(),
                sessionId: command.sessionId,
                userId: command.userId,
                clientType: command.clientType,
                metadata: {
                    error: true,
                    processingTime: Date.now() - timestamp.getTime(),
                },
            };

            this.addMessageToHistory(command.sessionId, fallbackMessage);
            return fallbackMessage;
        }
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

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
