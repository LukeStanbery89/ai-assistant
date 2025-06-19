import { container } from "tsyringe";
import { SingletonService } from "../service/impl/SingletonService";
import { IGreetingService } from "../service/IGreetingService";
import { FancyGreetingService } from "../service/impl/FancyGreetingService";

export function initDI() {
    container.registerSingleton(SingletonService);
    container.register<IGreetingService>("IGreetingService", {
        useClass: FancyGreetingService,
    });
}
