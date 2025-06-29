import { container } from "tsyringe";
import { SingletonService } from "../service/impl/SingletonService";
import { IConversationService } from "../service/IConversationService";
import { ConversationService } from "../service/impl/ConversationService";
import { IIntentParser } from "../service/IIntentParser";
import { WitAIIntentParser } from "../service/impl/WitAIIntentParser";
import { ILLMService } from "../service/ILLMService";
import { PlaceholderLLMService } from "../service/impl/PlaceholderLLMService";
import { logger } from "../utils";

export function initDI() {
    logger.debug("Initializing dependency injection container");

    // Legacy singleton service
    container.registerSingleton(SingletonService);

    // Intent Parser - easily swappable for future local models
    container.register<IIntentParser>("IIntentParser", {
        useClass: WitAIIntentParser,
    });

    // LLM Service - placeholder for now, easily swappable for real LLM later
    container.register<ILLMService>("ILLMService", {
        useClass: PlaceholderLLMService,
    });

    // Conversation Service - depends on both Intent Parser and LLM Service
    container.register<IConversationService>("IConversationService", {
        useClass: ConversationService,
    });

    logger.debug("Dependency injection container initialized", {
        services: ["IIntentParser", "ILLMService", "IConversationService"],
    });
}
