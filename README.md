# Jarvis V2 – AI Assistant Monorepo

This is a monorepo containing a React client and an Express server, both written in TypeScript.

## Project Structure

```
ai-assistant
├── client/                # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── ...
├── server/                # Express backend (TypeScript)
│   ├── src/
│   │   ├── app.ts
│   │   ├── controllers/
│   │   ├── loaders/
│   │   ├── routes/
│   │   ├── service/
│   │   └── ws-events/
│   ├── test/
│   ├── types/
│   └── ...
├── shared/                # (Reserved for shared code/types)
└── ...
```

## Installation

Clone the repository and install dependencies for all workspaces:

```bash
git clone https://github.com/LukeStanbery89/ai-assistant.git
cd ai-assistant
npm install
```

## Running the Application

To start both the client and server in development mode:

```bash
npm run dev
```

Or, to start both in production mode (after building):

```bash
npm run build
npm run start
```

You can also run the client or server individually:

```bash
npm run dev --workspace=client
npm run dev --workspace=server
```

## Testing

To run all tests:

```bash
npm test
```

## Linting & Formatting

To lint all code:

```bash
npm run lint
```

To automatically fix lint errors:

```bash
npm run lint:fix
```

To format code with Prettier:

```bash
npm run format
```

## License

This project is licensed under the MIT License.
