# AI Assistant App TODOs

## Phase 1: MVP (Minimal Viable Product)
- [x] Set up Github repo
    - [x] README.md / Documentation
    - [x] PR builds
    - [x] Main branch protection
- [ ] Implement a simple text chat client (REPL) for user input/output
    - [x] Set up boilerplate client
        - [x] Set up React / Vite development environment
        - [x] Set up test framework
        - [x] Set up routing
    - [ ] Set up CLI input loop
    - [ ] Display server responses
    - [ ] Handle basic input validation/errors
- [ ] Implement a server that receives user prompts and returns LLM-generated responses
    - [x] Set up boilerplate server
        - [x] Set up DI framework
        - [x] Set up linting
        - [x] Set up test framework
        - [ ] Set up Husky + pre-push hook
    - [ ] Implement prompt endpoint
    - [ ] Integrate with LLM API
    - [ ] Return responses to client
- [ ] Containerize the app with Docker
- [ ] Define and document JSON schemas for user prompt and server response payloads
- [ ] Specify and document API endpoints (REST/SSE) with request/response examples
- [ ] Add basic error handling and logging
- [ ] Write unit and integration tests for core functionality
    - [ ] Unit tests for client
    - [ ] Unit tests for server
    - [ ] Integration tests for end-to-end flow
- [ ] Integrate with APM (Application Performance Monitoring) software
- [ ] Perform audit to ensure that the codebase is clean, modular, and loosely coupled
- [ ] Ensure 85%+ line test coverage

## Phase 2: Look and Feel
- [ ] Design and implement a clean, intuitive UI for chat interactions
    - [ ] Design UI mockups
    - [ ] Implement chat window
    - [ ] Implement input controls
    - [ ] Style with CSS/framework
- [ ] Integrate speech-to-text (STT) for user voice input
    - [ ] Research/select STT library/service
    - [ ] Implement STT integration
    - [ ] Handle STT errors and edge cases
- [ ] Integrate text-to-speech (TTS) for dictating server responses
    - [ ] Research/select TTS library/service
    - [ ] Implement TTS integration
    - [ ] Handle TTS playback and errors
- [ ] Allow toggling between text and voice input modes
- [ ] Display prompt history and server responses in the UI
- [ ] Add connection status and error indicators
- [ ] Add user/session management
    - [ ] Design user/session schema
    - [ ] Implement user registration/login
    - [ ] Implement session tracking (cookies/tokens)
    - [ ] Handle session expiration/logout
- [ ] Add authentication and authorization
    - [ ] Implement authentication (password, OAuth, etc.)
    - [ ] Implement authorization logic (roles/permissions)
    - [ ] Secure endpoints and UI based on user roles
- [ ] Perform audit to ensure that the codebase is clean, modular, and loosely coupled
- [ ] Ensure 85%+ line test coverage

## Phase 3: Future Proof (Extensibility)
- [ ] Refactor codebase to support plug-and-play modules for core functionalities (STT, TTS, LLM, MCP, etc.)
    - [ ] Define module interface/contract
    - [ ] Refactor STT integration
    - [ ] Refactor TTS integration
    - [ ] Refactor LLM integration
    - [ ] Refactor MCP integration
- [ ] Define well-documented contracts/interfaces for each module type
    - [ ] Document STT contract
    - [ ] Document TTS contract
    - [ ] Document LLM contract
    - [ ] Document MCP contract
- [ ] Version API contracts and schemas for future compatibility
- [ ] Validate all incoming and outgoing data against schemas
- [ ] Improve documentation for setup, usage, and extension
- [ ] Perform audit to ensure that the codebase is clean, modular, and loosely coupled
- [ ] Ensure 85%+ line test coverage

## Phase 4: Feature Rich
- [ ] Integrate with MCP servers for additional context/data retrieval
- [ ] Add support for IoT (smart home) device control
- [ ] Implement weather updates, reminders, alarms, and lists
- [ ] Add support for third-party APIs and services
- [ ] Expand UI/UX for new features and integrations
- [ ] Enhance logging, monitoring, and analytics
- [ ] Implement a RAG (Retrieval-Augmented Generation) chain
- [ ] User identification via voice
- [ ] Perform audit to ensure that the codebase is clean, modular, and loosely coupled
- [ ] Ensure 85%+ line test coverage

## Phase 5: Stretch Goals
- [ ] User identification via face
- [ ] Design and build hardware client using microcontroller hardware