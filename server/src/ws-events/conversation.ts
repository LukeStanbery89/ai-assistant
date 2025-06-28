import WebSocket from "ws";
import { container } from "tsyringe";
import { ConversationCommand, WebSocketEventPayload } from "../../../shared/types";
import { IConversationService } from "../service/IConversationService";

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

        const conversationService = container.resolve<IConversationService>("IConversationService");
        const response = await conversationService.processMessage(payload);

        ws.send(
            JSON.stringify({
                type: "conversation_response",
                payload: response,
            }),
        );
    } catch (error) {
        console.error("Error handling conversation:", error);
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
