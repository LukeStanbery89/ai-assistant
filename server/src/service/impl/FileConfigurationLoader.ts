import { injectable } from "tsyringe";
import { promises as fs } from "fs";
import { join } from "path";
import { IConfigurationLoader } from "../IConfigurationLoader";
import { IntentParserConfig, IntentConfig } from "../../../../shared/types";
import { logger } from "../../utils";

@injectable()
export class FileConfigurationLoader implements IConfigurationLoader {
    private config: IntentParserConfig | null = null;
    private readonly configPath: string;

    constructor() {
        // Path to the configuration file relative to server root
        this.configPath = join(__dirname, "../../../config/intent_parser_config.json");
    }

    async loadIntentParserConfig(): Promise<IntentParserConfig> {
        if (this.config) {
            return this.config;
        }

        try {
            logger.debug("Loading intent parser configuration", {
                configPath: this.configPath,
            });

            const configData = await fs.readFile(this.configPath, "utf-8");
            const parsedConfig = JSON.parse(configData) as IntentParserConfig;

            // Validate configuration structure
            if (!parsedConfig.intents || typeof parsedConfig.intents !== "object") {
                throw new Error("Invalid configuration: missing or invalid 'intents' section");
            }

            if (!parsedConfig.entities || typeof parsedConfig.entities !== "object") {
                throw new Error("Invalid configuration: missing or invalid 'entities' section");
            }

            this.config = parsedConfig;

            logger.info("Intent parser configuration loaded successfully", {
                intentCount: Object.keys(parsedConfig.intents).length,
                entityCount: Object.keys(parsedConfig.entities).length,
                traitCount: Object.keys(parsedConfig.traits || {}).length,
            });

            return this.config;
        } catch (error) {
            logger.error("Failed to load intent parser configuration", {
                error: error instanceof Error ? error.message : "Unknown error",
                configPath: this.configPath,
            });

            throw new Error(`Configuration loading failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    async getAvailableIntents(): Promise<string[]> {
        const config = await this.loadIntentParserConfig();
        return Object.keys(config.intents);
    }

    async getIntentConfig(intentName: string): Promise<IntentConfig | undefined> {
        const config = await this.loadIntentParserConfig();
        return config.intents[intentName];
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.loadIntentParserConfig();
            return true;
        } catch (error) {
            logger.error("Configuration health check failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            return false;
        }
    }

    getVersion(): string {
        return "file-config-loader-v1.0.0";
    }

    /**
     * Clear cached configuration to force reload
     */
    clearCache(): void {
        this.config = null;
        logger.debug("Configuration cache cleared");
    }
}