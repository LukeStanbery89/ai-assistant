import { injectable } from "tsyringe";

@injectable()
export class SingletonService {
    private timestamp: string;

    constructor() {
        this.timestamp = Date.now().toString();
    }

    getTimestamp() {
        return this.timestamp;
    }
}
