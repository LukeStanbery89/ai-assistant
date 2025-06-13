import { injectable } from "tsyringe";
import { IGreetingService } from '../IGreetingService';

@injectable()
export class GreetingService implements IGreetingService {
    greet(name: string) {
        return `Hello, ${name}!`;
    }
}