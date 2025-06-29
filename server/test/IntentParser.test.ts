import { WitAIIntentParser } from "../src/service/impl/WitAIIntentParser";
import { PlaceholderLLMService } from "../src/service/impl/PlaceholderLLMService";
import { MessageIntent, WitAIResponse, IntentParserConfig } from "../../shared/types";
import { mapWitAIResponse, validateWitAIResponse, initializeIntentMapping } from "../src/service/mapper/WitAIResponseMapper";
import { IConfigurationLoader } from "../src/service/IConfigurationLoader";

// Mock fetch for testing
global.fetch = jest.fn();

describe("Intent Parser System", () => {
    let intentParser: WitAIIntentParser;
    let llmService: PlaceholderLLMService;
    let mockConfigLoader: jest.Mocked<IConfigurationLoader>;
    
    const mockConfig: IntentParserConfig = {
        intents: {
            get_weather: {
                description: "Get weather information",
                entities: ["wit/location"],
                examples: ["How's the weather in Chicago?"]
            },
            iot_control: {
                description: "Control IoT devices",
                entities: ["custom/device", "custom/value"],
                examples: ["Set thermostat to 72"]
            },
            chat: {
                description: "General chat",
                entities: [],
                examples: ["Hello"]
            }
        },
        entities: {},
        traits: {}
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.WIT_AI_ACCESS_TOKEN = "test-token";
        process.env.INTENT_PARSER_TIMEOUT = "3000";
        process.env.INTENT_CONFIDENCE_THRESHOLD = "0.7";
        
        // Create mock configuration loader
        mockConfigLoader = {
            loadIntentParserConfig: jest.fn().mockResolvedValue(mockConfig),
            getAvailableIntents: jest.fn().mockResolvedValue(Object.keys(mockConfig.intents)),
            getIntentConfig: jest.fn().mockImplementation((name) => Promise.resolve(mockConfig.intents[name])),
            isHealthy: jest.fn().mockResolvedValue(true),
            getVersion: jest.fn().mockReturnValue("mock-v1.0.0")
        };
        
        // Initialize mapping with mock config
        initializeIntentMapping(mockConfig);

        intentParser = new WitAIIntentParser(mockConfigLoader);
        llmService = new PlaceholderLLMService();
    });

    afterEach(() => {
        delete process.env.WIT_AI_ACCESS_TOKEN;
        delete process.env.INTENT_PARSER_TIMEOUT;
        delete process.env.INTENT_CONFIDENCE_THRESHOLD;
    });

    describe("WitAIIntentParser", () => {
        it("should parse weather intent correctly", async () => {
            const mockWitResponse: WitAIResponse = {
                entities: {
                    "wit$location:location": [
                        {
                            body: "Chicago",
                            confidence: 0.999,
                            end: 28,
                            start: 21,
                            entities: {},
                            id: "1365814687783405",
                            name: "wit$location",
                            role: "location",
                            type: "resolved",
                            value: "Chicago",
                            resolved: {
                                values: [
                                    {
                                        name: "Chicago",
                                        coords: { lat: 41.85002899169922, long: -87.6500473022461 },
                                        domain: "locality",
                                        external: {
                                            geonames: "4887398",
                                            wikidata: "Q1297",
                                            wikipedia: "Chicago",
                                        },
                                        timezone: "America/Chicago",
                                        attributes: {},
                                    },
                                ],
                            },
                        },
                    ],
                },
                intents: [
                    {
                        confidence: 0.9996766897730514,
                        id: "2033796803776155",
                        name: "get_weather",
                    },
                ],
                text: "How's the weather in Chicago?",
                traits: {
                    wit$sentiment: [
                        {
                            confidence: 0.8727579116821289,
                            id: "5ac2b50a-44e4-466e-9d49-bad6bd40092c",
                            value: "neutral",
                        },
                    ],
                },
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockWitResponse),
            });

            const result = await intentParser.parseIntent("How's the weather in Chicago?");

            expect(result.intent).toBe(MessageIntent.GET_WEATHER);
            expect(result.confidence).toBeCloseTo(0.9996766897730514);
            expect(result.parameters.location).toBe("Chicago");
            expect(result.parameters.location_coordinates).toEqual({
                lat: 41.85002899169922,
                long: -87.6500473022461,
            });
            expect(result.sentiment).toBe("neutral");
        });

        it("should parse IoT control intent correctly", async () => {
            const mockWitResponse: WitAIResponse = {
                entities: {
                    "iot_device:iot_device": [
                        {
                            body: "thermostat",
                            confidence: 0.9995,
                            end: 18,
                            start: 8,
                            entities: {},
                            id: "1362752794897123",
                            name: "iot_device",
                            role: "iot_device",
                            type: "value",
                            value: "thermostat",
                        },
                    ],
                    "wit$temperature:temperature": [
                        {
                            body: "72 degrees",
                            confidence: 0.9995,
                            end: 32,
                            start: 22,
                            entities: {},
                            id: "630358739848049",
                            name: "wit$temperature",
                            role: "temperature",
                            type: "value",
                            unit: "degree",
                            value: 72,
                        },
                    ],
                },
                intents: [
                    {
                        confidence: 0.9770713534308545,
                        id: "2033796803776155",
                        name: "iot_control",
                    },
                ],
                text: "Set the thermostat to 72 degrees",
                traits: {
                    wit$sentiment: [
                        {
                            confidence: 0.7022891640663147,
                            id: "5ac2b50a-44e4-466e-9d49-bad6bd40092c",
                            value: "neutral",
                        },
                    ],
                },
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockWitResponse),
            });

            const result = await intentParser.parseIntent("Set the thermostat to 72 degrees");

            expect(result.intent).toBe(MessageIntent.IOT_CONTROL);
            expect(result.confidence).toBeCloseTo(0.9770713534308545);
            expect(result.parameters.device).toBe("thermostat");
            expect(result.parameters.temperature).toBe(72);
            expect(result.parameters.temperature_unit).toBe("degree");
        });

        it("should fallback to chat intent when confidence is low", async () => {
            const mockWitResponse: WitAIResponse = {
                entities: {},
                intents: [
                    {
                        confidence: 0.5, // Below threshold
                        id: "12345",
                        name: "get_weather",
                    },
                ],
                text: "unclear message",
                traits: {},
            };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockWitResponse),
            });

            const result = await intentParser.parseIntent("unclear message");

            expect(result.intent).toBe(MessageIntent.CHAT);
            expect(result.confidence).toBe(0.5);
            expect(result.parameters.fallbackReason).toBe(
                "intent_parsing_failed_or_low_confidence",
            );
        });

        it("should fallback when API call fails", async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

            const result = await intentParser.parseIntent("test message");

            expect(result.intent).toBe(MessageIntent.CHAT);
            expect(result.parameters.originalMessage).toBe("test message");
        });

        it("should fallback when no token is provided", async () => {
            delete process.env.WIT_AI_ACCESS_TOKEN;
            const parserWithoutToken = new WitAIIntentParser(mockConfigLoader);

            const result = await parserWithoutToken.parseIntent("test message");

            expect(result.intent).toBe(MessageIntent.CHAT);
            expect(result.parameters.originalMessage).toBe("test message");
        });

        it("should report unhealthy when no token is provided", async () => {
            delete process.env.WIT_AI_ACCESS_TOKEN;
            const parserWithoutToken = new WitAIIntentParser(mockConfigLoader);

            const isHealthy = await parserWithoutToken.isHealthy();
            expect(isHealthy).toBe(false);
        });

        it("should return correct version", () => {
            expect(intentParser.getVersion()).toBe("wit-ai-v2.0.0-config");
        });
    });

    describe("PlaceholderLLMService", () => {
        it("should generate weather response", async () => {
            const response = await llmService.generateResponse(
                MessageIntent.GET_WEATHER,
                { location: "Chicago" },
                "How's the weather in Chicago?",
                undefined,
            );

            expect(response).toContain("weather");
            expect(response).toContain("Chicago");
        });

        it("should generate IoT control response", async () => {
            const response = await llmService.generateResponse(
                MessageIntent.IOT_CONTROL,
                { device: "thermostat", value: 72, unit: "degrees" },
                "Set the thermostat to 72 degrees",
                undefined,
            );

            expect(response).toContain("thermostat");
            expect(response).toContain("72");
        });

        it("should generate chat response", async () => {
            const response = await llmService.generateResponse(
                MessageIntent.CHAT,
                {},
                "Hello there",
                undefined,
            );

            expect(response).toContain("Hello there");
        });

        it("should generate help response", async () => {
            const response = await llmService.generateResponse(
                MessageIntent.CHAT,
                {},
                "help me",
                undefined,
            );

            expect(response).toContain("help me");
        });

        it("should always report healthy", async () => {
            const isHealthy = await llmService.isHealthy();
            expect(isHealthy).toBe(true);
        });

        it("should return correct version", () => {
            expect(llmService.getVersion()).toBe("placeholder-llm-v1.0.0");
        });
    });

    describe("WitAI Response Mapper", () => {
        it("should validate correct WitAI responses", () => {
            const validResponse = {
                text: "test",
                intents: [],
                entities: {},
                traits: {},
            };

            expect(validateWitAIResponse(validResponse)).toBe(true);
        });

        it("should reject invalid WitAI responses", () => {
            const invalidResponse = { invalid: true };
            expect(validateWitAIResponse(invalidResponse)).toBe(false);
        });

        it("should map WitAI response correctly", () => {
            const witResponse: WitAIResponse = {
                entities: {},
                intents: [{ confidence: 0.8, id: "123", name: "chat" }],
                text: "hello",
                traits: {},
            };

            const result = mapWitAIResponse(witResponse);

            expect(result.intent).toBe(MessageIntent.CHAT);
            expect(result.confidence).toBe(0.8);
        });
    });
});
