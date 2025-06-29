import {
    WitAIResponse,
    IntentParseResult,
    ParsedEntity,
    MessageIntent,
    WitAIEntity,
} from "../../../../shared/types";
import { logger } from "../../utils";

/**
 * Maps Wit.AI intent names to our internal MessageIntent enum
 */
const WIT_AI_INTENT_MAPPING: Record<string, MessageIntent> = {
    weather: MessageIntent.WEATHER,
    iot_control: MessageIntent.IOT_CONTROL,
    web_search: MessageIntent.WEB_SEARCH,
    reminder: MessageIntent.REMINDER,
    chat: MessageIntent.CHAT,
    help: MessageIntent.HELP,
};

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

        // Process different entity types
        if (entityKey.includes("iot_device")) {
            entities.push({
                name: "device",
                value: entity.value,
                confidence: entity.confidence,
                type: "device",
            });
        } else if (entityKey.includes("wit$temperature")) {
            entities.push({
                name: "temperature",
                value: entity.value,
                confidence: entity.confidence,
                type: "temperature",
                unit: entity.unit || "degree",
            });
        } else if (entityKey.includes("wit$location")) {
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
