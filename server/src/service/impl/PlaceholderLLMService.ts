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
            case MessageIntent.GET_WEATHER:
                return this.generateWeatherResponse(parameters);

            case MessageIntent.IOT_CONTROL:
                return this.generateIoTResponse(parameters);

            case MessageIntent.GET_TIME:
                return this.generateTimeResponse(parameters);

            case MessageIntent.WEB_SEARCH:
                return this.generateWebSearchResponse(parameters);

            case MessageIntent.SET_TIMER:
                return this.generateTimerResponse(parameters);

            case MessageIntent.SET_ALARM:
                return this.generateAlarmResponse(parameters);

            case MessageIntent.PLAY_MEDIA:
                return this.generateMediaResponse(parameters);

            case MessageIntent.GET_NEWS:
                return this.generateNewsResponse(parameters);

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
        const action = parameters.action;
        const value = parameters.value;
        const unit = parameters.unit;
        const location = parameters.location;

        let actionText = "";
        
        if (action && value) {
            const valueDisplay = unit ? `${value} ${unit}` : value;
            actionText = ` to ${action} it to ${valueDisplay}`;
        } else if (action) {
            actionText = ` to ${action} it`;
        } else if (value) {
            const valueDisplay = unit ? `${value} ${unit}` : value;
            actionText = ` to ${valueDisplay}`;
        }

        const locationText = location ? ` in the ${location}` : "";
        
        return `I understand you want to control your ${device}${locationText}${actionText}. That sounds perfect! Once I'm connected to your smart home system, I'll be able to control your ${device} and other IoT devices seamlessly.`;
    }

    private generateWebSearchResponse(parameters: Record<string, any>): string {
        const query = parameters.query || parameters.search || "your query";
        return `I'd be happy to search for information about "${query}"! Once I'm connected to web search services, I'll be able to find the most relevant and up-to-date information for you from across the internet.`;
    }

    private generateTimeResponse(parameters: Record<string, any>): string {
        const location = parameters.location;
        
        if (location) {
            return `I'd be happy to tell you the current time in ${location}! Once I'm connected to time services, I'll provide accurate local time, date, and timezone information for any location worldwide.`;
        } else {
            return `I'd be glad to tell you the current time! Once my time services are connected, I'll show you the exact time, date, and even help with timezone conversions.`;
        }
    }

    private generateTimerResponse(parameters: Record<string, any>): string {
        const duration = parameters.duration;
        
        if (duration) {
            return `Perfect! I'll set a timer for ${duration}. Once my timer system is active, I'll count down and notify you when the time is up. You'll be able to set multiple timers and I'll keep track of them all!`;
        } else {
            return `I'd be happy to set a timer for you! How long would you like the timer to run? Once my timing system is connected, I'll handle all your countdown needs.`;
        }
    }

    private generateAlarmResponse(parameters: Record<string, any>): string {
        const datetime = parameters.datetime;
        const label = parameters.label;
        
        let response = "I'll set an alarm for you";
        
        if (datetime) {
            response += ` at ${datetime}`;
        }
        
        if (label) {
            response += ` labeled "${label}"`;
        }
        
        response += "! Once my alarm system is set up, I'll make sure you wake up or get reminded exactly when you need to. You'll be able to set multiple alarms with custom labels.";
        
        return response;
    }

    private generateMediaResponse(parameters: Record<string, any>): string {
        const mediaType = parameters.media_type;
        const mediaTitle = parameters.media_title;
        const service = parameters.service;
        
        let response = "I'd love to help you play";
        
        if (mediaType) {
            response += ` ${mediaType}`;
        } else {
            response += " media";
        }
        
        if (mediaTitle) {
            response += ` "${mediaTitle}"`;
        }
        
        if (service) {
            response += ` on ${service}`;
        }
        
        response += "! Once I'm connected to your media services, I'll be able to control playback, find content, and manage your entertainment across all your devices.";
        
        return response;
    }

    private generateNewsResponse(parameters: Record<string, any>): string {
        const topic = parameters.topic;
        const location = parameters.location;
        
        let response = "I'll get you the latest news";
        
        if (topic) {
            response += ` about ${topic}`;
        }
        
        if (location) {
            response += ` from ${location}`;
        }
        
        response += "! Once I'm connected to news services, I'll provide you with current headlines, breaking news, and updates from reliable sources tailored to your interests.";
        
        return response;
    }

    private generateHelpResponse(): string {
        return `I'm your AI assistant and I'm here to help! Here's what I can do:

🌤️ **Weather**: Ask me about weather conditions anywhere
🏠 **Smart Home**: Control your IoT devices with voice commands  
🕐 **Time**: Get current time and date for any location
🔍 **Web Search**: Find information across the internet
⏲️ **Timers**: Set countdown timers for any duration
⏰ **Alarms**: Set alarms for specific times with custom labels
🎵 **Media**: Play music, videos, and podcasts on your devices
📰 **News**: Get latest news by topic or location
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
