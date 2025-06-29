import winston from "winston";
import { existsSync, mkdirSync } from "fs";

// Define log levels with colors
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "white",
    debug: "gray",
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output with columns
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Create tidy columns: Timestamp | Level | Message | Additional Data
        const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : "";
        return `${timestamp} | ${level.padEnd(17)} | ${message}${metaStr}`;
    }),
);

// Custom format for file output (no colors)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
);

// Check if file logging is enabled via environment variable
const enableFileLogging = process.env.ENABLE_FILE_LOGGING === "true";

// Base transports (always include console)
const transports: winston.transport[] = [
    // Console transport with colors and formatting
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// Optional file transports (only if enabled via env var)
if (enableFileLogging) {
    // Create logs directory if it doesn't exist
    const ensureLogDir = () => {
        const logDir = "logs";
        if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
        }
    };

    ensureLogDir();

    // Add file transports
    transports.push(
        // File transport for errors
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat,
        }),

        // File transport for all logs
        new winston.transports.File({
            filename: "logs/combined.log",
            format: fileFormat,
        }),
    );
}

// Create the logger
const logger = winston.createLogger({
    levels,
    level: process.env.LOG_LEVEL || "info",
    transports,

    // Handle uncaught exceptions and unhandled rejections (only if file logging enabled)
    ...(enableFileLogging && {
        exceptionHandlers: [new winston.transports.File({ filename: "logs/exceptions.log" })],
        rejectionHandlers: [new winston.transports.File({ filename: "logs/rejections.log" })],
    }),
});

export default logger;
