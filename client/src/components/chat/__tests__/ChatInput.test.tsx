import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInput from "../ChatInput";

describe("ChatInput", () => {
    const mockOnSendMessage = jest.fn();

    beforeEach(() => {
        mockOnSendMessage.mockClear();
    });

    it("should render input and send button", () => {
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        expect(screen.getByPlaceholderText("Type your message...")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should allow typing in textarea", async () => {
        const user = userEvent.setup();
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");
        await user.type(textarea, "Hello world");

        expect(textarea).toHaveValue("Hello world");
    });

    it("should send message when send button is clicked", async () => {
        const user = userEvent.setup();
        mockOnSendMessage.mockResolvedValue(undefined);
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");
        const sendButton = screen.getByRole("button", { name: "Send" });

        await user.type(textarea, "Test message");
        await user.click(sendButton);

        expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("should send message when Enter is pressed", async () => {
        const user = userEvent.setup();
        mockOnSendMessage.mockResolvedValue(undefined);
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");

        await user.type(textarea, "Test message");
        await user.keyboard("{Enter}");

        expect(mockOnSendMessage).toHaveBeenCalledWith("Test message");
    });

    it("should add new line when Shift+Enter is pressed", async () => {
        const user = userEvent.setup();
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");

        await user.type(textarea, "Line 1");
        await user.keyboard("{Shift>}{Enter}{/Shift}");
        await user.type(textarea, "Line 2");

        expect(textarea).toHaveValue("Line 1\nLine 2");
        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("should clear input after successful send", async () => {
        const user = userEvent.setup();
        mockOnSendMessage.mockResolvedValue(undefined);
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");

        await user.type(textarea, "Test message");
        await user.keyboard("{Enter}");

        await waitFor(() => {
            expect(textarea).toHaveValue("");
        });
    });

    it("should not send empty messages", async () => {
        const user = userEvent.setup();
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const sendButton = screen.getByRole("button", { name: "Send" });

        await user.click(sendButton);

        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("should not send whitespace-only messages", async () => {
        const user = userEvent.setup();
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");
        const sendButton = screen.getByRole("button", { name: "Send" });

        await user.type(textarea, "   ");
        await user.click(sendButton);

        expect(mockOnSendMessage).not.toHaveBeenCalled();
    });

    it("should disable input when disabled prop is true", () => {
        render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);

        const textarea = screen.getByPlaceholderText("Type your message...");
        const sendButton = screen.getByRole("button", { name: "Send" });

        expect(textarea).toBeDisabled();
        expect(sendButton).toBeDisabled();
    });

    it("should show loading state while sending", async () => {
        const user = userEvent.setup();
        let resolvePromise: () => void;
        const promise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        mockOnSendMessage.mockReturnValue(promise);
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");
        const sendButton = screen.getByRole("button", { name: "Send" });

        await user.type(textarea, "Test message");
        await user.click(sendButton);

        // Should show loading state
        expect(sendButton).toBeDisabled();
        expect(screen.getByText("Sending...")).toBeInTheDocument();

        // Resolve the promise and wait for state to update
        resolvePromise!();
        await waitFor(() => {
            expect(textarea).toHaveValue("");
        });
        
        // After message is sent and cleared, send button should be disabled (no content)
        // But the loading state should be finished
        await waitFor(() => {
            expect(sendButton).toBeDisabled(); // Disabled because input is empty
            expect(screen.queryByText("Sending...")).not.toBeInTheDocument();
        });
    });

    it("should use custom placeholder when provided", () => {
        render(
            <ChatInput 
                onSendMessage={mockOnSendMessage} 
                placeholder="Custom placeholder" 
            />
        );

        expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
    });

    it("should handle send errors gracefully", async () => {
        const user = userEvent.setup();
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        mockOnSendMessage.mockRejectedValue(new Error("Send failed"));
        
        render(<ChatInput onSendMessage={mockOnSendMessage} />);

        const textarea = screen.getByPlaceholderText("Type your message...");

        await user.type(textarea, "Test message");
        await user.keyboard("{Enter}");

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Failed to send message:", expect.any(Error));
        });

        // Input should not be cleared on error
        expect(textarea).toHaveValue("Test message");

        consoleSpy.mockRestore();
    });
});