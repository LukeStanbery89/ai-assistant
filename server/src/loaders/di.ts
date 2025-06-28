import { container } from "tsyringe";
import { SingletonService } from "../service/impl/SingletonService";
import { IGreetingService } from "../service/IGreetingService";
import { FancyGreetingService } from "../service/impl/FancyGreetingService";
import { IConversationService } from "../service/IConversationService";
import { ConversationService } from "../service/impl/ConversationService";

export function initDI() {
    container.registerSingleton(SingletonService);
    container.register<IGreetingService>("IGreetingService", {
        useClass: FancyGreetingService,
    });
    container.register<IConversationService>("IConversationService", {
        useClass: ConversationService,
    });
}
