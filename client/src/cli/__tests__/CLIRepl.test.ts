import { CLIRepl } from '../CLIRepl';
import * as WebSocket from 'ws';
import * as readline from 'readline';

// Mock WebSocket
jest.mock('ws');
const MockWebSocket = WebSocket.default as jest.MockedClass<typeof WebSocket.default>;

// Mock readline
jest.mock('readline');
const mockReadline = readline as jest.Mocked<typeof readline>;

// Mock console methods to avoid test output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleClean = jest.spyOn(console, 'clear').mockImplementation();

// Mock process.exit
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation();

describe('CLIRepl', () => {
    let mockWs: jest.Mocked<WebSocket>;
    let mockRl: jest.Mocked<readline.Interface>;
    let cliRepl: CLIRepl;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup readline mock
        mockRl = {
            on: jest.fn(),
            prompt: jest.fn(),
            close: jest.fn(),
        } as any;
        mockReadline.createInterface.mockReturnValue(mockRl);

        // Setup WebSocket mock
        mockWs = {
            on: jest.fn(),
            send: jest.fn(),
            close: jest.fn(),
            readyState: WebSocket.default.OPEN,
        } as any;
        MockWebSocket.mockImplementation(() => mockWs);

        cliRepl = new CLIRepl();
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
        mockConsoleClean.mockRestore();
        mockProcessExit.mockRestore();
    });

    describe('constructor', () => {
        it('should create readline interface with correct configuration', () => {
            expect(mockReadline.createInterface).toHaveBeenCalledWith({
                input: process.stdin,
                output: process.stdout,
                prompt: '> '
            });
        });

        it('should setup readline event handlers', () => {
            expect(mockRl.on).toHaveBeenCalledWith('line', expect.any(Function));
            expect(mockRl.on).toHaveBeenCalledWith('close', expect.any(Function));
        });
    });

    describe('start', () => {
        it('should display welcome message and connect to server', async () => {
            // Mock successful connection
            mockWs.on.mockImplementation((event, callback) => {
                if (event === 'open') {
                    setTimeout(() => callback(), 0);
                }
                return mockWs;
            });

            await cliRepl.start();

            expect(mockConsoleLog).toHaveBeenCalledWith('🤖 AI Assistant CLI');
            expect(mockConsoleLog).toHaveBeenCalledWith('Connecting to server...');
            expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:3000');
        });

        it('should exit on connection failure', async () => {
            // Mock connection timeout
            mockWs.on.mockImplementation((event, callback) => {
                if (event === 'error') {
                    setTimeout(() => callback(new Error('Connection failed')), 0);
                }
                return mockWs;
            });

            await cliRepl.start();

            expect(mockConsoleLog).toHaveBeenCalledWith('❌ Failed to connect to server.');
            expect(mockProcessExit).toHaveBeenCalledWith(1);
        });
    });

    describe('readline event handling', () => {
        let lineHandler: (input: string) => void;

        beforeEach(() => {
            // Get the line handler that was registered
            const onCalls = mockRl.on.mock.calls;
            const lineCall = onCalls.find(call => call[0] === 'line');
            lineHandler = lineCall![1] as (input: string) => void;
        });

        it('should prompt again for empty input', () => {
            lineHandler('');
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it('should exit on quit command', () => {
            lineHandler('quit');
            expect(mockProcessExit).toHaveBeenCalledWith(0);
        });

        it('should exit on exit command', () => {
            lineHandler('exit');
            expect(mockProcessExit).toHaveBeenCalledWith(0);
        });

        it('should clear console on clear command', () => {
            lineHandler('clear');
            expect(mockConsoleClean).toHaveBeenCalled();
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it('should show not connected message when disconnected', () => {
            lineHandler('hello');
            expect(mockConsoleLog).toHaveBeenCalledWith('❌ Not connected to server. Please wait for connection...');
            expect(mockRl.prompt).toHaveBeenCalled();
        });
    });

    describe('WebSocket message handling', () => {
        let messageHandler: (data: any) => void;

        beforeEach(() => {
            // Simulate connection and get message handler
            const onCalls = mockWs.on.mock.calls;
            const messageCall = onCalls.find(call => call[0] === 'message');
            messageHandler = messageCall![1] as (data: any) => void;
        });

        it('should handle conversation response messages', () => {
            const mockResponse = {
                type: 'conversation_response',
                payload: {
                    id: 'test-id',
                    type: 'assistant',
                    content: 'Hello! How can I help you?',
                    timestamp: new Date(),
                    sessionId: 'test-session',
                    userId: 'test-user',
                    clientType: 'terminal'
                }
            };

            messageHandler(Buffer.from(JSON.stringify(mockResponse)));

            expect(mockConsoleLog).toHaveBeenCalledWith('\n🤖 Hello! How can I help you?\n');
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it('should handle error messages', () => {
            const mockError = {
                type: 'error',
                payload: {
                    message: 'Test error message'
                }
            };

            messageHandler(Buffer.from(JSON.stringify(mockError)));

            expect(mockConsoleLog).toHaveBeenCalledWith('\n❌ Error: Test error message\n');
            expect(mockRl.prompt).toHaveBeenCalled();
        });

        it('should handle invalid JSON gracefully', () => {
            messageHandler(Buffer.from('invalid json'));

            expect(mockConsoleLog).toHaveBeenCalledWith('❌ Error parsing server message:', expect.any(SyntaxError));
        });
    });

    describe('sendMessage', () => {
        let lineHandler: (input: string) => void;

        beforeEach(() => {
            // Get the line handler and simulate connection
            const onCalls = mockRl.on.mock.calls;
            const lineCall = onCalls.find(call => call[0] === 'line');
            lineHandler = lineCall![1] as (input: string) => void;

            // Simulate connected state
            (cliRepl as any).isConnected = true;
            (cliRepl as any).ws = mockWs;
        });

        it('should send properly formatted conversation command', () => {
            lineHandler('test message');

            expect(mockWs.send).toHaveBeenCalledWith(
                JSON.stringify({
                    type: 'conversation',
                    payload: {
                        sessionId: expect.stringMatching(/^cli-session-/),
                        message: 'test message',
                        clientType: 'terminal',
                        userId: expect.stringMatching(/^cli-user-/)
                    }
                })
            );
            expect(mockConsoleLog).toHaveBeenCalledWith('⏳ Sending message...');
        });

        it('should not send message when not connected', () => {
            mockWs.readyState = WebSocket.default.CLOSED;

            lineHandler('test message');

            expect(mockWs.send).not.toHaveBeenCalled();
            expect(mockConsoleLog).toHaveBeenCalledWith('❌ Not connected to server');
        });

        it('should prevent multiple concurrent messages', () => {
            // Set waiting state
            (cliRepl as any).isWaitingForResponse = true;

            lineHandler('test message');

            expect(mockWs.send).not.toHaveBeenCalled();
            expect(mockConsoleLog).toHaveBeenCalledWith('⏳ Please wait for the current response...');
        });
    });
});