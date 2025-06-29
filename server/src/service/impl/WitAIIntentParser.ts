import { injectable } from "tsyringe";
import { IIntentParser } from "../IIntentParser";
import {
    IntentParseResult,
    UserContext,
    WitAIResponse,
    MessageIntent,
} from "../../../../shared/types";
import { mapWitAIResponse, validateWitAIResponse } from "../mapper/WitAIResponseMapper";
import { logger } from "../../utils";

@injectable()
export class WitAIIntentParser implements IIntentParser {
    private readonly baseUrl = "https://api.wit.ai";
    private readonly accessToken: string;
    private readonly timeout: number;
    private readonly confidenceThreshold: number;

    constructor() {
        this.accessToken = process.env.WIT_AI_ACCESS_TOKEN || "";
        this.timeout = parseInt(process.env.INTENT_PARSER_TIMEOUT || "3000");
        this.confidenceThreshold = parseFloat(process.env.INTENT_CONFIDENCE_THRESHOLD || "0.7");

        if (!this.accessToken) {
            logger.warn("WIT_AI_ACCESS_TOKEN not configured - intent parsing will use fallback");
        }
    }

    async parseIntent(message: string, context?: UserContext): Promise<IntentParseResult> {
        if (!this.accessToken) {
            logger.debug("No Wit.AI token configured, falling back to chat intent");
            return this.createFallbackResult(message);
        }

        try {
            logger.debug("Parsing intent with Wit.AI", {
                message: message.substring(0, 100), // Log first 100 chars
                userId: context?.userId,
            });

            const witResponse = await this.callWitAI(message);
            const parseResult = mapWitAIResponse(witResponse);

            // Check confidence threshold
            if (parseResult.confidence < this.confidenceThreshold) {
                logger.debug("Intent confidence below threshold, falling back to chat", {
                    confidence: parseResult.confidence,
                    threshold: this.confidenceThreshold,
                    originalIntent: parseResult.intent,
                });

                return this.createFallbackResult(message, parseResult.confidence);
            }

            logger.info("Intent parsed successfully", {
                intent: parseResult.intent,
                confidence: parseResult.confidence,
                entityCount: parseResult.entities.length,
            });

            return parseResult;
        } catch (error) {
            logger.error("Intent parsing failed, falling back to chat", {
                error: error instanceof Error ? error.message : "Unknown error",
                message: message.substring(0, 100),
            });

            return this.createFallbackResult(message);
        }
    }

    async isHealthy(): Promise<boolean> {
        if (!this.accessToken) {
            return false;
        }

        try {
            // Simple health check with a test message
            await this.callWitAI("hello");
            return true;
        } catch (error) {
            logger.error("Wit.AI health check failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            return false;
        }
    }

    getVersion(): string {
        return "wit-ai-v1.0.0";
    }

    /**
     * Makes HTTP request to Wit.AI API
     */
    private async callWitAI(message: string): Promise<WitAIResponse> {
        const encodedMessage = encodeURIComponent(message);
        const url = `${this.baseUrl}/message?q=${encodedMessage}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "User-Agent": "AI-Assistant/1.0.0",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Wit.AI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!validateWitAIResponse(data)) {
                throw new Error("Invalid response format from Wit.AI");
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === "AbortError") {
                throw new Error(`Wit.AI API timeout after ${this.timeout}ms`);
            }

            throw error;
        }
    }

    /**
     * Creates a fallback result when intent parsing fails or confidence is low
     */
    private createFallbackResult(message: string, confidence: number = 0.5): IntentParseResult {
        return {
            intent: MessageIntent.CHAT,
            parameters: {
                originalMessage: message,
                fallbackReason: "intent_parsing_failed_or_low_confidence",
            },
            confidence,
            entities: [],
            sentiment: "neutral",
        };
    }
}
