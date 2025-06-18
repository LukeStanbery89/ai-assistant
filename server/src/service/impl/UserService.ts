import { inject, injectable } from "tsyringe";
import { IGreetingService } from "../IGreetingService";

@injectable()
export class UserService {
    constructor(@inject("IGreetingService") private greetingService: IGreetingService) {}

    welcomeUser(username: string) {
        return this.greetingService.greet(username);
    }
}
