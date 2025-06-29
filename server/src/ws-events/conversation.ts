import WebSocket from "ws";
import { container } from "tsyringe";
import { ConversationCommand, WebSocketEventPayload } from "../../../shared/types";
import { IConversationService } from "../service/IConversationService";
import { logger } from "../utils";

// Type guard to check if payload is a ConversationCommand
function isConversationCommand(
    payload: WebSocketEventPayload | ConversationCommand,
): payload is ConversationCommand {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "sessionId" in payload &&
        "message" in payload &&
        "clientType" in payload &&
        "userId" in payload
    );
}

export const handleConversation = async (
    ws: WebSocket,
    payload: WebSocketEventPayload | ConversationCommand,
) => {
    try {
        if (!isConversationCommand(payload)) {
            logger.warn("Invalid conversation command received", {
                payload: typeof payload === "object" ? Object.keys(payload || {}) : typeof payload,
            });
            ws.send(
                JSON.stringify({
                    type: "error",
                    payload: {
                        message: "Invalid conversation command format",
                        error: "Expected ConversationCommand object",
                    },
                }),
            );
            return;
        }

        logger.info("Processing conversation message", {
            sessionId: payload.sessionId,
            userId: payload.userId,
            clientType: payload.clientType,
            messageLength: payload.message.length,
        });

        const conversationService = container.resolve<IConversationService>("IConversationService");
        const response = await conversationService.processMessage(payload);

        logger.debug("Conversation message processed successfully", {
            sessionId: payload.sessionId,
            responseId: response.id,
            responseLength: response.content.length,
        });

        ws.send(
            JSON.stringify({
                type: "conversation_response",
                payload: response,
            }),
        );
    } catch (error) {
        logger.error("Failed to process conversation message", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            payload: typeof payload === "object" ? payload : undefined,
        });
        ws.send(
            JSON.stringify({
                type: "error",
                payload: {
                    message: "Failed to process message",
                    error: error instanceof Error ? error.message : "Unknown error",
                },
            }),
        );
    }
};
