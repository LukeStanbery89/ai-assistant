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
        confidence?: number;
        entities?: ParsedEntity[];
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

// Intent Parser interfaces
export interface IntentParseResult {
    intent: MessageIntent;
    parameters: Record<string, any>;
    confidence: number;
    entities: ParsedEntity[];
    sentiment?: string;
    rawResponse?: any; // Store original response for debugging
}

export interface ParsedEntity {
    name: string;
    value: any;
    confidence: number;
    type: 'text' | 'number' | 'date' | 'location' | 'device' | 'temperature';
    unit?: string; // For temperature, distance, etc.
    coordinates?: { lat: number; long: number }; // For locations
    resolvedValues?: any[]; // For complex entities like locations
}

// Wit.AI specific response types
export interface WitAIResponse {
    entities: Record<string, WitAIEntity[]>;
    intents: WitAIIntent[];
    text: string;
    traits: Record<string, WitAITrait[]>;
}

export interface WitAIEntity {
    body: string;
    confidence: number;
    end: number;
    start: number;
    entities: Record<string, any>;
    id: string;
    name: string;
    role: string;
    type: 'value' | 'resolved';
    value: any;
    unit?: string;
    resolved?: {
        values: Array<{
            name: string;
            coords?: { lat: number; long: number };
            timezone?: string;
            domain?: string;
            external?: Record<string, string>;
            attributes?: Record<string, any>;
        }>;
    };
}

export interface WitAIIntent {
    confidence: number;
    id: string;
    name: string;
}

export interface WitAITrait {
    confidence: number;
    id: string;
    value: string;
}

// LLM Integration interfaces (placeholder)
export interface LLMPromptTemplate {
    intent: MessageIntent;
    systemPrompt: string;
    userPromptTemplate: string;
}