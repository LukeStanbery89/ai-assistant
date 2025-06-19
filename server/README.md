# Express Server – AI Assistant

This is an Express server written in TypeScript.

## Project Structure

```
server/
├── src/
│   ├── app.ts                   # Entry point of the server application
│   ├── controllers/             # Controllers for handling requests
│   ├── loaders/                 # Application loaders (e.g., DI setup, WebSocket)
│   ├── routes/                  # Route definitions
│   ├── service/
│   │   ├── IGreetingService.ts  # Service interface
│   │   └── impl/                # Service implementations
│   ├── types/                   # Custom type definitions
│   └── ws-events/               # WebSocket event handlers
├── test/
│   ├── GreetingService.test.ts
│   └── setupTests.ts
└── ...
```

## Installation

To get started, clone the repository and install the dependencies (from the project root):

```bash
git clone https://github.com/LukeStanbery89/ai-assistant.git
cd ai-assistant
npm install
```

> **Note:** This project uses npm workspaces. Installing dependencies from the root will install both client and server dependencies.

## Running the Application

To run the server in development mode:

```bash
npm run dev --workspace=server
```

To build and run the server in production mode:

```bash
npm run build --workspace=server
npm run start --workspace=server
```

The server will start on port `4000` by default (or the value in your `.env`).

## License

This project is licensed under the MIT License.
