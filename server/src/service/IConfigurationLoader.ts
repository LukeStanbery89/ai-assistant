import { IntentParserConfig } from "../../../shared/types";

/**
 * Interface for loading and managing configuration for the intent parser
 */
export interface IConfigurationLoader {
    /**
     * Load the intent parser configuration from file
     * @returns Promise containing the parsed configuration
     */
    loadIntentParserConfig(): Promise<IntentParserConfig>;

    /**
     * Get all configured intent names
     * @returns Array of intent names
     */
    getAvailableIntents(): Promise<string[]>;

    /**
     * Get configuration for a specific intent
     * @param intentName The name of the intent
     * @returns Intent configuration or undefined if not found
     */
    getIntentConfig(intentName: string): Promise<import("../../../shared/types").IntentConfig | undefined>;

    /**
     * Check if configuration is valid and available
     * @returns Promise indicating configuration health status
     */
    isHealthy(): Promise<boolean>;

    /**
     * Get the version/identifier of the configuration loader
     * @returns Version string or implementation identifier
     */
    getVersion(): string;
}