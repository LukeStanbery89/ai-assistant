import { ConversationMessage, ConversationCommand } from "../../../shared/types";

export interface IConversationService {
    processMessage(command: ConversationCommand): Promise<ConversationMessage>;
    getConversationHistory(sessionId: string, userId: string): Promise<ConversationMessage[]>;
}
