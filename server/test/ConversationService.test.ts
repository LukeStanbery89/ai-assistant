import { ConversationService } from '../src/service/impl/ConversationService';
import { ConversationCommand, MessageIntent } from '../../shared/types';

describe('ConversationService', () => {
    let conversationService: ConversationService;

    beforeEach(() => {
        conversationService = new ConversationService();
    });

    describe('processMessage', () => {
        it('should process a simple message and return assistant response', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'Hello',
                clientType: 'terminal',
                userId: 'test-user'
            };

            const response = await conversationService.processMessage(command);

            expect(response).toMatchObject({
                type: 'assistant',
                content: 'Hello! How can I help you today?',
                sessionId: 'test-session',
                userId: 'test-user',
                clientType: 'terminal',
                metadata: {
                    intent: MessageIntent.CHAT
                }
            });
            expect(response.id).toBeDefined();
            expect(response.timestamp).toBeInstanceOf(Date);
        });

        it('should respond with weather message for weather queries', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'What is the weather like?',
                clientType: 'browser',
                userId: 'test-user'
            };

            const response = await conversationService.processMessage(command);

            expect(response.content).toBe('I can help with weather information, but I need to be connected to a weather service first.');
        });

        it('should respond with help message for help queries', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'help me',
                clientType: 'terminal',
                userId: 'test-user'
            };

            const response = await conversationService.processMessage(command);

            expect(response.content).toBe('I\'m an AI assistant that can help with various tasks. Try asking me about the weather, or just have a conversation!');
        });

        it('should provide default response for unknown messages', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'random message',
                clientType: 'terminal',
                userId: 'test-user'
            };

            const response = await conversationService.processMessage(command);

            expect(response.content).toBe('You said: "random message". I\'m a simple AI assistant and I\'m still learning. How can I help you?');
        });

        it('should store conversation history', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'Hello',
                clientType: 'terminal',
                userId: 'test-user'
            };

            await conversationService.processMessage(command);
            const history = await conversationService.getConversationHistory('test-session', 'test-user');

            expect(history).toHaveLength(2); // user message + assistant response
            expect(history[0].type).toBe('user');
            expect(history[0].content).toBe('Hello');
            expect(history[1].type).toBe('assistant');
        });
    });

    describe('getConversationHistory', () => {
        it('should return empty array for non-existent session', async () => {
            const history = await conversationService.getConversationHistory('non-existent', 'user');
            expect(history).toEqual([]);
        });

        it('should return conversation history for existing session', async () => {
            const command: ConversationCommand = {
                sessionId: 'test-session',
                message: 'Test message',
                clientType: 'terminal',
                userId: 'test-user'
            };

            await conversationService.processMessage(command);
            const history = await conversationService.getConversationHistory('test-session', 'test-user');

            expect(history).toHaveLength(2);
            expect(history[0].content).toBe('Test message');
        });
    });
});