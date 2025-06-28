#!/usr/bin/env node

import { CLIRepl } from './CLIRepl';

// Start the REPL
const repl = new CLIRepl();
repl.start().catch((error) => {
    console.error('Failed to start REPL:', error);
    process.exit(1);
});