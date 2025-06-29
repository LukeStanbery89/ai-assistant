import { injectable } from "tsyringe";
import { ILLMService } from "../ILLMService";
import { MessageIntent, UserContext } from "../../../../shared/types";
import { logger } from "../../utils";

@injectable()
export class PlaceholderLLMService implements ILLMService {
    async generateResponse(
        intent: MessageIntent,
        parameters: Record<string, any>,
        userMessage: string,
        context?: UserContext,
    ): Promise<string> {
        logger.debug("Generating placeholder LLM response", {
            intent,
            parametersCount: Object.keys(parameters).length,
            userId: context?.userId,
        });

        switch (intent) {
            case MessageIntent.WEATHER:
                return this.generateWeatherResponse(parameters);

            case MessageIntent.IOT_CONTROL:
                return this.generateIoTResponse(parameters);

            case MessageIntent.WEB_SEARCH:
                return this.generateWebSearchResponse(parameters);

            case MessageIntent.REMINDER:
                return this.generateReminderResponse(parameters);

            case MessageIntent.HELP:
                return this.generateHelpResponse();

            case MessageIntent.CHAT:
            default:
                return this.generateChatResponse(userMessage, parameters);
        }
    }

    async isHealthy(): Promise<boolean> {
        return true; // Placeholder service is always healthy
    }

    getVersion(): string {
        return "placeholder-llm-v1.0.0";
    }

    private generateWeatherResponse(parameters: Record<string, any>): string {
        const location = parameters.location;
        const coordinates = parameters.location_coordinates;

        if (location) {
            const coordsInfo = coordinates
                ? ` (${coordinates.lat.toFixed(2)}, ${coordinates.long.toFixed(2)})`
                : "";

            return `I'd love to help you check the weather in ${location}${coordsInfo}! Once I'm connected to a weather service, I'll be able to provide real-time forecasts, temperature, humidity, and conditions for your location.`;
        } else {
            return "I'd be happy to help you check the weather! Could you tell me which location you're interested in? Once I'm connected to a weather service, I'll provide detailed forecasts.";
        }
    }

    private generateIoTResponse(parameters: Record<string, any>): string {
        const device = parameters.device || "device";
        const temperature = parameters.temperature;
        const temperatureUnit = parameters.temperature_unit;

        if (temperature !== undefined) {
            const tempDisplay = temperatureUnit
                ? `${temperature} ${temperatureUnit}${temperatureUnit === "degree" ? "°" : ""}`
                : `${temperature}°`;

            return `I understand you want to set your ${device} to ${tempDisplay}. That's a great temperature! Once I'm connected to your smart home system, I'll be able to control your ${device} and other IoT devices seamlessly.`;
        } else {
            return `I see you want to control your ${device}. Smart home control is one of my favorite features! Once I'm integrated with your IoT system, I'll help you manage all your connected devices with simple voice commands.`;
        }
    }

    private generateWebSearchResponse(parameters: Record<string, any>): string {
        const query = parameters.query || parameters.search || "your query";
        return `I'd be happy to search for information about "${query}"! Once I'm connected to web search services, I'll be able to find the most relevant and up-to-date information for you from across the internet.`;
    }

    private generateReminderResponse(parameters: Record<string, any>): string {
        const task = parameters.task || parameters.reminder || "your task";
        const time = parameters.time || parameters.when;

        if (time) {
            return `Got it! I'll remind you about "${task}" at ${time}. Once my reminder system is set up, I'll make sure you never miss important tasks or appointments.`;
        } else {
            return `I'll help you remember "${task}"! When would you like me to remind you? Once my scheduling system is active, I'll keep track of all your important tasks and reminders.`;
        }
    }

    private generateHelpResponse(): string {
        return `I'm your AI assistant and I'm here to help! Here's what I can do:

🌤️ **Weather**: Ask me about weather conditions anywhere
🏠 **Smart Home**: Control your IoT devices with voice commands  
🔍 **Web Search**: Find information across the internet
⏰ **Reminders**: Set and manage your tasks and appointments
💬 **Chat**: Have natural conversations about anything

I'm still learning and connecting to services, but I'm excited to help you with all these tasks soon! What would you like to try first?`;
    }

    private generateChatResponse(userMessage: string, parameters: Record<string, any>): string {
        const fallbackReason = parameters.fallbackReason;

        if (fallbackReason === "intent_parsing_failed_or_low_confidence") {
            return `Thanks for chatting with me! You said: "${userMessage}". I'm still learning to understand different requests, but I'm here to help. Could you try rephrasing your question, or let me know if you'd like help with weather, smart home control, or other tasks?`;
        }

        // Handle common chat patterns
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
            return "You're very welcome! I'm happy to help. Is there anything else you'd like to know or any other way I can assist you?";
        }

        if (
            lowerMessage.includes("hello") ||
            lowerMessage.includes("hi") ||
            lowerMessage.includes("hey")
        ) {
            return "Hello there! It's great to meet you. I'm your AI assistant, ready to help with weather, smart home control, reminders, searches, and more. What can I do for you today?";
        }

        if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you feel")) {
            return "I'm doing wonderful, thank you for asking! I'm excited to learn and help you with various tasks. I'm currently getting connected to different services so I can assist you better. How are you doing today?";
        }

        if (
            lowerMessage.includes("goodbye") ||
            lowerMessage.includes("bye") ||
            lowerMessage.includes("see you")
        ) {
            return "Goodbye! It was great chatting with you. Feel free to come back anytime you need help with weather, smart home control, or just want to have a conversation. Take care!";
        }

        // Default chat response
        return `That's interesting! You mentioned: "${userMessage}". I enjoy our conversation. While I'm still learning and connecting to various services, I'm here to chat and help however I can. What else would you like to talk about or explore together?`;
    }
}
