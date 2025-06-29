import {
    WitAIResponse,
    IntentParseResult,
    ParsedEntity,
    MessageIntent,
    WitAIEntity,
    IntentParserConfig,
} from "../../../../shared/types";
import { logger } from "../../utils";

/**
 * Maps Wit.AI intent names to our internal MessageIntent enum
 * This is now populated dynamically from configuration
 */
let WIT_AI_INTENT_MAPPING: Record<string, MessageIntent> = {};

/**
 * Initialize the intent mapping from configuration
 */
export function initializeIntentMapping(config: IntentParserConfig): void {
    WIT_AI_INTENT_MAPPING = {};
    
    // Map each configured intent to its corresponding MessageIntent enum value
    for (const intentName of Object.keys(config.intents)) {
        // Convert intent name to MessageIntent enum value
        const enumValue = intentName.toUpperCase() as keyof typeof MessageIntent;
        if (MessageIntent[enumValue]) {
            WIT_AI_INTENT_MAPPING[intentName] = MessageIntent[enumValue];
        } else {
            logger.warn(`Unknown intent in configuration: ${intentName}`);
            WIT_AI_INTENT_MAPPING[intentName] = MessageIntent.CHAT;
        }
    }
    
    logger.info("Intent mapping initialized", {
        mappingCount: Object.keys(WIT_AI_INTENT_MAPPING).length,
        mappings: WIT_AI_INTENT_MAPPING,
    });
}

/**
 * Maps a Wit.AI response to our internal IntentParseResult format
 */
export function mapWitAIResponse(response: WitAIResponse): IntentParseResult {
    try {
        // Extract primary intent
        const primaryIntent = response.intents?.[0];
        const intent = primaryIntent
            ? WIT_AI_INTENT_MAPPING[primaryIntent.name] || MessageIntent.CHAT
            : MessageIntent.CHAT;

        const confidence = primaryIntent?.confidence || 0.5;

        // Process entities
        const entities = extractEntities(response.entities);

        // Convert entities to parameters
        const parameters = entitiesToParameters(entities);

        // Extract sentiment
        const sentiment = response.traits?.["wit$sentiment"]?.[0]?.value;

        logger.debug("Mapped Wit.AI response", {
            intent,
            confidence,
            entityCount: entities.length,
            sentiment,
        });

        return {
            intent,
            parameters,
            confidence,
            entities,
            sentiment,
            rawResponse: response,
        };
    } catch (error) {
        logger.error("Failed to map Wit.AI response", {
            error: error instanceof Error ? error.message : "Unknown error",
            response,
        });

        // Return fallback result
        return {
            intent: MessageIntent.CHAT,
            parameters: { originalMessage: response.text },
            confidence: 0.3,
            entities: [],
            sentiment: "neutral",
            rawResponse: response,
        };
    }
}

/**
 * Extracts and processes entities from Wit.AI entities object
 */
function extractEntities(witEntities: Record<string, WitAIEntity[]>): ParsedEntity[] {
    const entities: ParsedEntity[] = [];

    for (const [entityKey, entityArray] of Object.entries(witEntities)) {
        if (!entityArray || entityArray.length === 0) continue;

        // Take the first (highest confidence) entity
        const entity = entityArray[0];

        // Process different entity types based on entity key patterns
        if (entityKey.includes("custom/device") || entityKey.includes("iot_device")) {
            entities.push({
                name: "device",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "device",
            });
        } else if (entityKey.includes("custom/action")) {
            entities.push({
                name: "action",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/value")) {
            entities.push({
                name: "value",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "number",
            });
        } else if (entityKey.includes("custom/unit")) {
            entities.push({
                name: "unit",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/query")) {
            entities.push({
                name: "query",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/label")) {
            entities.push({
                name: "label",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/media_type")) {
            entities.push({
                name: "media_type",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/media_title")) {
            entities.push({
                name: "media_title",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/service")) {
            entities.push({
                name: "service",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("custom/topic")) {
            entities.push({
                name: "topic",
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        } else if (entityKey.includes("wit$temperature") || entityKey.includes("wit/temperature")) {
            entities.push({
                name: "temperature",
                value: entity.value,
                confidence: entity.confidence,
                type: "temperature",
                unit: entity.unit || "degree",
            });
        } else if (entityKey.includes("wit$location") || entityKey.includes("wit/location")) {
            const locationValue = entity.resolved?.values?.[0]?.name || entity.body;
            const coordinates = entity.resolved?.values?.[0]?.coords;

            entities.push({
                name: "location",
                value: locationValue,
                confidence: entity.confidence,
                type: "location",
                coordinates,
                resolvedValues: entity.resolved?.values,
            });
        } else if (entityKey.includes("wit$datetime") || entityKey.includes("wit/datetime")) {
            entities.push({
                name: "datetime",
                value: entity.value,
                confidence: entity.confidence,
                type: "date",
            });
        } else if (entityKey.includes("wit$duration") || entityKey.includes("wit/duration")) {
            entities.push({
                name: "duration",
                value: entity.value,
                confidence: entity.confidence,
                type: "text",
                unit: entity.unit,
            });
        } else {
            // Generic entity handling
            entities.push({
                name: entity.role || entity.name,
                value: entity.value || entity.body,
                confidence: entity.confidence,
                type: "text",
            });
        }
    }

    return entities;
}

/**
 * Converts parsed entities to a parameters object for easier access
 */
function entitiesToParameters(entities: ParsedEntity[]): Record<string, any> {
    const parameters: Record<string, any> = {};

    for (const entity of entities) {
        parameters[entity.name] = entity.value;

        // Add additional properties for specific entity types
        if (entity.type === "temperature" && entity.unit) {
            parameters[`${entity.name}_unit`] = entity.unit;
        }

        if (entity.type === "location" && entity.coordinates) {
            parameters[`${entity.name}_coordinates`] = entity.coordinates;
        }
        
        if (entity.unit) {
            parameters[`${entity.name}_unit`] = entity.unit;
        }
        
        if (entity.resolvedValues) {
            parameters[`${entity.name}_resolved`] = entity.resolvedValues;
        }
    }

    return parameters;
}

/**
 * Validates if a Wit.AI response has the expected structure
 */
export function validateWitAIResponse(response: any): response is WitAIResponse {
    return (
        typeof response === "object" &&
        response !== null &&
        typeof response.text === "string" &&
        Array.isArray(response.intents) &&
        typeof response.entities === "object" &&
        typeof response.traits === "object"
    );
}
