# AI Assistant Implementation Plan

## Project Overview

An AI assistant application supporting multiple client interfaces (terminal REPL, browser chat, voice) with a shared conversation engine that processes tasks and information requests through pluggable modules.

## Architecture Summary

### Three Client Types
1. **Terminal REPL Client** - Command-line interface with readline
2. **Browser Chat Client** - ChatGPT-style web interface  
3. **Voice Client** - Wake phrase detection + STT/TTS (future)

### Core Principles
- **Client-Agnostic Conversation Engine**: All clients use identical message protocols
- **Task-Oriented Processing**: Focus on task execution and information retrieval (no code execution)
- **Pluggable Module System**: Weather, IoT, search, etc. modules with common interfaces
- **Multi-User Support**: User identification and context management
- **RAG + MCP Integration**: Rich context for LLM response generation

## Technical Architecture

### Message Flow
```
User Input → Client → WebSocket → Conversation Service → Intent Analysis → 
Input Parsing → Module Registry → Task Module → [MCP Server] → 
RAG Chain → LLM Service → Response → Client → User Output
```

### Key Components

**Shared Types** (`shared/types.ts`):
```typescript
interface ConversationMessage {
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

interface ConversationCommand {
  sessionId: string;
  message: string;
  clientType: 'terminal' | 'browser' | 'voice';
  userId: string;
  context?: UserContext;
}

interface UserContext {
  userId: string;
  preferences: Record<string, any>;
  conversationHistory: ConversationMessage[];
  sessionState: Record<string, any>;
  lastActivity: Date;
}

interface ParsedInputs {
  intent: MessageIntent;
  parameters: Record<string, any>;
  targetDevice?: string;
  targetValue?: any;
  location?: string;
  timeframe?: string;
}

interface TaskResult {
  success: boolean;
  data: any;
  message: string;
  metadata?: Record<string, any>;
}

enum MessageIntent {
  WEATHER = 'weather',
  IOT_CONTROL = 'iot_control',
  WEB_SEARCH = 'web_search',
  REMINDER = 'reminder',
  CHAT = 'chat',
  HELP = 'help'
}
```

**Core Services**:

1. **IConversationService** - Main conversation orchestration
2. **IIntentAnalyzer** - Determine message intent from user input
3. **IInputParser** - Extract key parameters from user message
4. **ITaskModuleRegistry** - Route requests to appropriate modules
5. **IUserContextManager** - Manage multi-user contexts
6. **IRagChainService** - Build enriched context for LLM
7. **ILlmService** - Generate human-like responses

**Task Modules**:
- **WeatherModule** - Weather forecasts and conditions
- **IoTModule** - Smart home device control
- **SearchModule** - Web and knowledge base search
- **ReminderModule** - Task and calendar management
- **ChatModule** - General conversation handling

## Implementation Steps

### Phase 1: Core Infrastructure

#### Step 1: Extend Shared Types
- [ ] Add conversation types to `shared/types.ts`
- [ ] Define task module interfaces
- [ ] Create user context types

#### Step 2: Server Core Services
- [ ] Create `IConversationService` interface and implementation
- [ ] Implement `IIntentAnalyzer` with simple keyword matching
- [ ] Create `IInputParser` for parameter extraction
- [ ] Build `ITaskModuleRegistry` for module routing
- [ ] Implement `IUserContextManager` for multi-user support

#### Step 3: Basic Task Modules
- [ ] Create `ITaskModule` base interface
- [ ] Implement simple `ChatModule` for general conversation
- [ ] Create placeholder modules (Weather, IoT, Search, Reminder)
- [ ] Register modules in DI container

#### Step 4: WebSocket Integration
- [ ] Update WebSocket handler for conversation events
- [ ] Implement message routing to conversation service
- [ ] Add error handling and validation

### Phase 2: Browser Chat Client

#### Step 5: React Chat Interface
- [ ] Create chat page with message history
- [ ] Build message bubble components (user/assistant styling)
- [ ] Implement chat input with multi-line support
- [ ] Add WebSocket client integration
- [ ] Create user identification mechanism

#### Step 6: UI Polish
- [ ] Add ChatGPT-style responsive design
- [ ] Implement auto-scrolling message list
- [ ] Add typing indicators and connection status
- [ ] Include copy functionality for messages

### Phase 3: Advanced Features

#### Step 7: LLM Integration
- [ ] Create `ILlmService` interface
- [ ] Implement LLM API integration (OpenAI/Anthropic)
- [ ] Build response generation pipeline
- [ ] Add response formatting and error handling

#### Step 8: RAG + MCP Integration
- [ ] Design `IRagChainService` interface
- [ ] Implement context building from user history
- [ ] Integrate with MCP servers for additional context
- [ ] Enhance LLM prompts with enriched context

#### Step 9: Real Task Modules
- [ ] Implement `WeatherModule` with API integration
- [ ] Build basic `IoTModule` for smart home control
- [ ] Create `SearchModule` with web search capabilities
- [ ] Develop `ReminderModule` with persistence

### Phase 4: Additional Clients

#### Step 10: Terminal REPL Client
- [x] Create Node.js CLI application
- [x] Implement readline interface
- [x] Add WebSocket connection to server
- [ ] Build command history and auto-completion

#### Step 11: Voice Client (Future)
- [ ] Implement wake phrase detection
- [ ] Add speech-to-text integration
- [ ] Create text-to-speech output
- [ ] Build user identification (voice/face recognition)

## Code Style Requirements

- **Yoda Notation**: Use for equality evaluations (`'text' === inputMode`)
- **Interface-First Design**: Define interfaces before implementations
- **Dependency Injection**: Use TSyringe throughout
- **Type Safety**: Leverage TypeScript strict mode

## Current Project State

### Completed
- [x] Basic monorepo structure with client/server workspaces
- [x] WebSocket event system foundation
- [x] Dependency injection setup with TSyringe
- [x] React client with routing
- [x] Basic Express server with TypeScript

### In Progress (docs/todos.md Phase 1)
- [x] Implement a simple text chat client (REPL) for user input/output
- [ ] Implement a server that receives user prompts and returns LLM-generated responses

## Files Created/Modified

### New Files to Create
- `shared/types.ts` - Enhanced with conversation types
- `server/src/service/IConversationService.ts`
- `server/src/service/IIntentAnalyzer.ts`
- `server/src/service/IInputParser.ts`
- `server/src/service/ITaskModuleRegistry.ts`
- `server/src/service/IUserContextManager.ts`
- `server/src/service/IRagChainService.ts`
- `server/src/service/ILlmService.ts`
- `server/src/service/modules/ITaskModule.ts`
- `server/src/service/modules/ChatModule.ts`
- `server/src/ws-events/conversation.ts`
- `client/src/pages/Chat.tsx`
- `client/src/components/chat/MessageHistory.tsx`
- `client/src/components/chat/MessageBubble.tsx`
- `client/src/components/chat/ChatInput.tsx`
- `client/src/hooks/useChatWebSocket.ts`

### Files to Update
- `server/src/loaders/di.ts` - Register new services
- `server/src/ws-events/index.ts` - Add conversation handler
- `client/src/App.tsx` - Add chat route
- `shared/types.ts` - Add conversation types

## Next Session Priorities

1. **Start with Step 1-2**: Extend shared types and create core conversation service
2. **Build basic conversation flow**: Intent analysis → module routing → response
3. **Create simple chat module**: Handle basic conversational responses
4. **Test end-to-end flow**: Browser → WebSocket → Conversation Service → Response

## Sequence Diagram Reference

See `docs/sequence-diagram.puml` for complete architectural flow visualization.

## Notes

- Architecture designed for extensibility and multi-client support
- Focus on task execution rather than code execution
- Modular design allows easy addition of new capabilities
- Voice client architecture planned but not immediately implemented
- RAG and MCP integration provides rich context for responses