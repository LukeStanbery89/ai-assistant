import { GreetingService } from '../src/service/impl/GreetingService';

test('should return a greeting message', () => {
    const service = new GreetingService();
    expect(service.greet('World')).toBe('Hello, World!');
});