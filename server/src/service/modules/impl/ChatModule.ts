import { injectable } from "tsyringe";
import { ParsedInputs, TaskResult, MessageIntent } from "../../../../../shared/types";
import { ITaskModule } from "../ITaskModule";

@injectable()
export class ChatModule implements ITaskModule {
    readonly intent = MessageIntent.CHAT;

    canHandle(inputs: ParsedInputs): boolean {
        return MessageIntent.CHAT === inputs.intent;
    }

    async execute(inputs: ParsedInputs): Promise<TaskResult> {
        const message = (inputs.parameters.message as string) || "";
        const response = this.generateChatResponse(message);

        return {
            success: true,
            data: { response },
            message: response,
            metadata: {
                intent: this.intent,
                timestamp: new Date().toISOString(),
            },
        };
    }

    private generateChatResponse(message: string): string {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
            return "Hello! How can I help you today?";
        }

        if (lowerMessage.includes("how are you")) {
            return "I'm doing well, thank you for asking! How are you?";
        }

        if (lowerMessage.includes("thank")) {
            return "You're welcome! Is there anything else I can help you with?";
        }

        if (lowerMessage.includes("bye")) {
            return "Goodbye! Have a great day!";
        }

        return `I understand you said: "${message}". I'm still learning, but I'm here to help! What would you like to talk about?`;
    }
}
