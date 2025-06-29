import { MessageIntent, UserContext } from "../../../shared/types";

/**
 * Interface for Large Language Model services that generate human-like responses
 * based on parsed intent and extracted parameters.
 */
export interface ILLMService {
    /**
     * Generate a human-like response based on parsed intent and parameters
     * @param intent The determined intent from the user's message
     * @param parameters Extracted parameters and entities from the message
     * @param userMessage The original user message for context
     * @param context Optional user context for personalization
     * @returns Promise containing the generated response text
     */
    generateResponse(
        intent: MessageIntent,
        parameters: Record<string, any>,
        userMessage: string,
        context?: UserContext,
    ): Promise<string>;

    /**
     * Check if the LLM service is healthy and available
     * @returns Promise indicating service health status
     */
    isHealthy(): Promise<boolean>;

    /**
     * Get the version/identifier of the LLM implementation
     * @returns Version string or implementation identifier
     */
    getVersion(): string;
}
