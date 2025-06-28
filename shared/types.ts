export type WebSocketEventPayload = string | number | boolean | null;

// WebSocket Event Schema
export interface WebSocketEvent<T = unknown> {
    type: string;
    payload: T;
}

export interface ConversationEvent extends WebSocketEvent<ConversationCommand> {
    type: 'conversation';
}

export interface ConversationResponseEvent extends WebSocketEvent<ConversationMessage> {
    type: 'conversation_response';
}

export interface PingEvent extends WebSocketEvent<{ timestamp: number; }> {
    type: 'ping';
}

export interface PongEvent extends WebSocketEvent<{ timestamp: number; }> {
    type: 'pong';
}

export interface ErrorEvent extends WebSocketEvent<{ message: string; error?: string; }> {
    type: 'error';
}

export type WebSocketEventTypes =
    | ConversationEvent
    | ConversationResponseEvent
    | PingEvent
    | PongEvent
    | ErrorEvent;

export interface ConversationMessage {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    sessionId: string;
    userId: string;
    clientType: 'terminal' | 'browser' | 'voice';
    metadata?: {
        processingTime?: number;
        error?: boolean;
        intent?: MessageIntent;
    };
}

export interface ConversationCommand {
    sessionId: string;
    message: string;
    clientType: 'terminal' | 'browser' | 'voice';
    userId: string;
    context?: UserContext;
}

export interface UserContext {
    userId: string;
    preferences: Record<string, any>;
    conversationHistory: ConversationMessage[];
    sessionState: Record<string, any>;
    lastActivity: Date;
}

export interface ParsedInputs {
    intent: MessageIntent;
    parameters: Record<string, any>;
    targetDevice?: string;
    targetValue?: any;
    location?: string;
    timeframe?: string;
}

export interface TaskResult {
    success: boolean;
    data: any;
    message: string;
    metadata?: Record<string, any>;
}

export enum MessageIntent {
    WEATHER = 'weather',
    IOT_CONTROL = 'iot_control',
    WEB_SEARCH = 'web_search',
    REMINDER = 'reminder',
    CHAT = 'chat',
    HELP = 'help'
}