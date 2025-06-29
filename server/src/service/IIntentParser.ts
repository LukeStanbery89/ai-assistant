import { IntentParseResult, UserContext } from "../../../shared/types";

/**
 * Interface for intent parsing services that analyze user messages
 * to determine intent and extract relevant entities/parameters.
 */
export interface IIntentParser {
    /**
     * Parse a user message to determine intent and extract entities
     * @param message The user's input message
     * @param context Optional user context for better parsing
     * @returns Promise containing parsed intent, entities, and confidence
     */
    parseIntent(message: string, context?: UserContext): Promise<IntentParseResult>;

    /**
     * Check if the intent parser service is healthy and available
     * @returns Promise indicating service health status
     */
    isHealthy(): Promise<boolean>;

    /**
     * Get the version/identifier of the intent parser implementation
     * @returns Version string or implementation identifier
     */
    getVersion(): string;
}
