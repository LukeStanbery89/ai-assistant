import { container } from "tsyringe";
import { SingletonService } from "../service/impl/SingletonService";
import { IConversationService } from "../service/IConversationService";
import { ConversationService } from "../service/impl/ConversationService";
import { logger } from "../utils";

export function initDI() {
    logger.debug("Initializing dependency injection container");
    container.registerSingleton(SingletonService);
    container.register<IConversationService>("IConversationService", {
        useClass: ConversationService,
    });
}
