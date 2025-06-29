import { render, screen } from "@testing-library/react";
import MessageBubble from "../MessageBubble";
import type { ConversationMessage } from "../../../../../shared/types";

const createMockMessage = (overrides: Partial<ConversationMessage> = {}): ConversationMessage => ({
    id: "test-123",
    type: "user",
    content: "Test message",
    timestamp: new Date("2024-01-01T12:00:00Z"),
    sessionId: "session-123",
    userId: "user-123",
    clientType: "browser",
    ...overrides
});

describe("MessageBubble", () => {
    it("should render user message with correct styling", () => {
        const message = createMockMessage({
            type: "user",
            content: "Hello from user"
        });

        render(<MessageBubble message={message} />);

        expect(screen.getByText("Hello from user")).toBeInTheDocument();
        
        // Get the content div and go up to the bubble container
        const contentDiv = screen.getByText("Hello from user");
        const bubbleDiv = contentDiv.parentElement;
        expect(bubbleDiv).toHaveClass("bg-gradient-to-br");
        expect(bubbleDiv).toHaveClass("from-primary-500");
        expect(bubbleDiv).toHaveClass("text-white");
    });

    it("should render assistant message with correct styling", () => {
        const message = createMockMessage({
            type: "assistant",
            content: "Hello from assistant"
        });

        render(<MessageBubble message={message} />);

        expect(screen.getByText("Hello from assistant")).toBeInTheDocument();
        
        // Get the content div and go up to the bubble container
        const contentDiv = screen.getByText("Hello from assistant");
        const bubbleDiv = contentDiv.parentElement;
        expect(bubbleDiv).toHaveClass("bg-white");
        expect(bubbleDiv).toHaveClass("text-gray-900");
    });

    it("should render system message with special styling", () => {
        const message = createMockMessage({
            type: "system",
            content: "System notification"
        });

        render(<MessageBubble message={message} />);

        expect(screen.getByText("System notification")).toBeInTheDocument();
        
        const container = screen.getByText("System notification").closest("div");
        expect(container).toHaveClass("bg-gray-100");
        expect(container).toHaveClass("text-gray-600");
    });

    it("should display timestamp", () => {
        const message = createMockMessage({
            timestamp: new Date("2024-01-01T12:00:00Z")
        });

        render(<MessageBubble message={message} />);

        // Time display depends on local timezone, just check some time is displayed
        expect(screen.getByText(/\d{1,2}:\d{2}\s*(AM|PM)/)).toBeInTheDocument();
    });

    it("should show error indicator when message has error metadata", () => {
        const message = createMockMessage({
            metadata: {
                error: true
            }
        });

        render(<MessageBubble message={message} />);

        expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should show processing time when available", () => {
        const message = createMockMessage({
            metadata: {
                processingTime: 150
            }
        });

        render(<MessageBubble message={message} />);

        expect(screen.getByText("(150ms)")).toBeInTheDocument();
    });

    it("should handle multiline content", () => {
        const message = createMockMessage({
            content: "Line 1\nLine 2\nLine 3"
        });

        render(<MessageBubble message={message} />);

        // Check that the content div has the correct class for handling whitespace
        const messageContainer = screen.getByText(/Line 1/);
        expect(messageContainer).toHaveClass("whitespace-pre-wrap");
    });

    it("should break long words", () => {
        const message = createMockMessage({
            content: "verylongwordthatshouldbebrokentofitinthecontainer"
        });

        render(<MessageBubble message={message} />);

        const content = screen.getByText(message.content);
        expect(content).toHaveClass("break-words");
    });
});