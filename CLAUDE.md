# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Getting Started

**IMPORTANT**: At the beginning of each new Claude Code CLI session, review the contents of the `docs/` directory to understand the current project state, implementation plan, and todo list. This provides essential context about:
- Overall architecture and goals (`docs/implementation-plan.md`)
- Current progress and next priorities (`docs/todos.md`)
- System flow and component interactions (`docs/sequence-diagram.puml`)

## Development Commands

### GitHub CLI Commands

**Reading PR Inline Comments**
To read inline review comments on a pull request, use:
```bash
gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/LukeStanbery89/ai-assistant/pulls/[PR_NUMBER]/comments
```
Replace `[PR_NUMBER]` with the actual PR number. This returns detailed JSON with all inline comments, including the file path, line number, and comment body.

### Root Level Commands
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both workspaces  
- `npm run test` - Run all tests across workspaces with coverage reports
- `npm run test:client` - Run only client tests with coverage
- `npm run test:server` - Run only server tests with coverage
- `npm run lint` - Lint all code
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier

### Workspace-specific Commands
- `npm run dev --workspace=client` - Start only the React client (Vite dev server)
- `npm run dev --workspace=server` - Start only the Express server (ts-node)
- `npm run build --workspace=client` - Build client with TypeScript and Vite
- `npm run build --workspace=server` - Build server with TypeScript compiler

### Testing & Coverage
- **Coverage Reports**: Both client and server generate comprehensive test coverage reports
  - Console output shows coverage tables with percentages and uncovered lines
  - HTML reports generated in `coverage/` directories for detailed analysis
  - LCOV reports for integration with CI/CD and code analysis tools
- **Coverage Thresholds**: Configured to maintain code quality standards
  - Client: 45% minimum coverage across all metrics
  - Server: 25% minimum coverage (lower due to infrastructure code not covered in unit tests)
- **Test Files**: Use Jest with TypeScript support
  - Client: React Testing Library for component tests
  - Server: Jest with mocking for service and handler tests

### Environment Variables
Server configuration can be controlled via environment variables (see `server/.env.example`):
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (development, production)
- `LOG_LEVEL` - Logging level: error, warn, info, debug (default: info)
- `ENABLE_FILE_LOGGING` - Enable file logging to logs/ directory (default: false)

## Architecture Overview

This is a TypeScript monorepo for an AI assistant with multiple client interfaces:

### Core Conversation Engine (`/server`)
- Express.js with TypeScript
- Dependency injection using TSyringe container
- WebSocket server with event-based message handling
- Modular architecture with controllers, services, and loaders
- **Reusable conversation engine** supporting multiple client types
- **Structured Logging**: Winston-based logging system with:
  - Colored console output (white for info, yellow for warnings, red for errors)
  - Timestamp and structured columns for easy reading
  - Optional file logging controlled by `ENABLE_FILE_LOGGING=true` environment variable
  - Configurable log levels via `LOG_LEVEL` environment variable (info, debug, warn, error)
  - JSON format for file logs, human-readable format for console

### Client Types

**Browser Chat Client (`/client`)**
- React 19 with Vite build tool
- ChatGPT-style conversation interface
- WebSocket connection for real-time messaging
- React Router for client-side routing

**Terminal REPL Client** (Future)
- Command-line interface using readline
- Text-based prompt/response loop
- WebSocket connection to same conversation engine

**Voice Client** (Future)
- Wake phrase detection
- Speech-to-text input processing
- Text-to-speech response output
- WebSocket connection to same conversation engine

### Shared Infrastructure (`/shared`)
- Common types and interfaces between all clients
- Conversation protocol definitions
- Message formatting utilities

### Key Architectural Patterns

**Multi-Client Conversation Engine**: Core conversation processing is client-agnostic. All clients (browser, terminal, voice) communicate through identical WebSocket message protocols to the same conversation engine.

**Task-Oriented Processing**: The assistant focuses on task execution and information retrieval rather than code execution. Examples include reminders, weather queries, smart home control, and general information requests.

**Dependency Injection**: Server uses TSyringe for dependency injection. Services are registered in `server/src/loaders/di.ts` and resolved via the container.

**WebSocket Event System**: 
- Events are handled in `server/src/ws-events/` directory
- Each event type has its own handler file (e.g., `conversation.ts`, `ping.ts`)
- Events are mapped in `server/src/ws-events/index.ts`
- All clients send events with `{ type: string, payload: ConversationCommand }`

**Pluggable Task Processors**: Task handling is modular with pluggable processors for different domains (weather, reminders, smart home, etc.).

**Shared Types**: Common types are in `/shared/types.ts` and used by all clients and server.

**Service Layer**: Business logic is implemented in services under `server/src/service/` with interface-based design.

## Key Files to Understand

- `server/src/app.ts` - Main server entry point with Express setup and HTTP server creation
- `server/src/loaders/index.ts` - Initialization of DI container and WebSocket server
- `server/src/loaders/websocket.ts` - WebSocket server configuration and event routing
- `server/src/service/IConversationService.ts` - Core conversation engine interface
- `server/src/service/ITaskProcessor.ts` - Plugin interface for task processors
- `client/src/App.tsx` - Main React component with WebSocket connection logic
- `shared/types.ts` - Shared type definitions between all clients and server

## Development Notes

- Server runs on port 4000 (configurable via PORT env var)
- Client WebSocket connects to ws://localhost:3000 (hardcoded)
- Hot module replacement enabled for client development
- TypeScript strict mode enabled for both workspaces

## Code Style Guidelines

- **Yoda Notation**: Use Yoda notation for equality evaluations (e.g., `'text' === inputMode` instead of `inputMode === 'text'`)
- **Interface-First Design**: Define interfaces before implementations
- **Dependency Injection**: Use TSyringe for all service dependencies
- **Type Safety**: Leverage TypeScript strict mode throughout
- **Indentation**: Use 4-space indentation for all code files

## Conversation Engine Design

The core conversation engine is designed to be client-agnostic:

1. **Message Protocol**: All clients use identical `ConversationCommand` and `ConversationMessage` types
2. **Intent Analysis**: Messages are analyzed for intent (task request, information query, etc.)
3. **Task Routing**: Intents are routed to appropriate task processors
4. **Response Formatting**: Responses are formatted appropriately for each client type
5. **Session Management**: Conversation context is maintained across messages

### Example Message Flow:
```
Client → ConversationCommand → Intent Analysis → Task Processor → ConversationMessage → Client
```

This design enables easy addition of new client types without modifying the core conversation logic.