import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

function ChatInput({ 
    onSendMessage, 
    disabled = false, 
    placeholder = "Type your message..." 
}: ChatInputProps) {
    const [input, setInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Auto-focus the input when component mounts
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSubmit = async () => {
        const message = input.trim();
        if (!message || isSubmitting || disabled) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSendMessage(message);
            setInput('');
            
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSubmitting(false);
            
            // Refocus the input
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if ('Enter' === e.key) {
            if (e.shiftKey) {
                // Allow Shift+Enter for new lines
                return;
            } else {
                // Send message on Enter
                e.preventDefault();
                handleSubmit();
            }
        }
    };

    const handleInputChange = (value: string) => {
        setInput(value);
        
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const canSend = input.trim().length > 0 && !isSubmitting && !disabled;

    return (
        <div className="border-t bg-white px-4 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled || isSubmitting}
                            rows={1}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                disabled || isSubmitting 
                                    ? 'bg-gray-100 cursor-not-allowed' 
                                    : 'bg-white'
                            }`}
                            style={{
                                minHeight: '48px',
                                maxHeight: '120px'
                            }}
                        />
                        
                        {(disabled || isSubmitting) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 rounded-lg">
                                <div className="text-gray-500 text-sm">
                                    {isSubmitting ? 'Sending...' : 'Disconnected'}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        disabled={!canSend}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            canSend
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        type="button"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Send'
                        )}
                    </button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    );
}

export default ChatInput;