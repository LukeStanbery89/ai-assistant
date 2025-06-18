import { IGreetingService } from "../IGreetingService";

export class FancyGreetingService implements IGreetingService {
    greet(name: string): string {
        return `Top o' the mornin' to ya, ${name}!`;
    }
}
