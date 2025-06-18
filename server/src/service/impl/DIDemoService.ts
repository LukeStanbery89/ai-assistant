import { container, injectable } from 'tsyringe';
import { UserService } from './UserService';
import { SingletonService } from './SingletonService';

@injectable()
export class DIDemoService {
    demo() {
        const userService = container.resolve(UserService);
        console.log(userService.welcomeUser("Luke"));

        const SingletonService1 = container.resolve(SingletonService);
        console.log("singleton timestamp 1:", SingletonService1.getTimestamp());
        setTimeout(() => {
            const SingletonService2 = container.resolve(SingletonService);
            console.log("singleton timestamp 2:", SingletonService2.getTimestamp());
        }, 1000);
    }
}